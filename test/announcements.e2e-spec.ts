/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Announcement } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('Announcements CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    // Override StorageService to avoid importing ESM-only dependencies during tests
    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: () => Promise.resolve('https://storage.example/ann.pdf'),
      deleteFile: () => Promise.resolve(),
    });

    // Override JwtAuthGuard so requests are authenticated in tests and request.user is set
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app = moduleFixture.createNestApplication();
    // also set global guard to ensure request.user is present for non-overridden paths
    app.useGlobalGuards(new MockAuthGuard());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform CRUD for Announcement', async () => {
    const payload = {
      title: `E2E Announcement ${Date.now()}`,
      description: 'E2E announcement body',
    };

    const userEmail = `e2e-ann-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: { name: 'E2E Ann User', email: userEmail, password: 'password' },
      update: {},
    });

    setMockUser({ id: createdUser.id, email: createdUser.email });

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/announcements')
      .send(payload)
      .expect(201);

    const created = asApiResponse<Announcement>(createRes).data;
    expect(created).toHaveProperty('id');
    // createdById should be auto-populated by interceptor to the mock user id
    expect(created.createdById).toBe(createdUser.id);

    const announcementId = created.id;

    // Update
    const updateRes = await request(app.getHttpServer())
      .put(`/announcements/${announcementId}`)
      .send({ title: 'Updated announcement' })
      .expect(200);

    const updated = asApiResponse<Announcement>(updateRes).data;
    expect(updated.title).toBe('Updated announcement');
    // updatedById should be set by interceptor
    expect(updated.updatedById).toBe(createdUser.id);

    // Delete
    await request(app.getHttpServer())
      .delete(`/announcements/${announcementId}`)
      .expect(200);
  });
});
