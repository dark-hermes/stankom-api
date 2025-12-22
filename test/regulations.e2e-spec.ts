/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Regulation } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('Regulations CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    // Override StorageService to avoid importing ESM-only dependencies during tests
    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: () => Promise.resolve('https://storage.example/reg.pdf'),
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

  it('should perform CRUD for Regulation', async () => {
    const payload = {
      title: `E2E Regulation ${Date.now()}`,
      description: 'E2E regulation body',
    };

    const userEmail = `e2e-reg-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: { name: 'E2E Reg User', email: userEmail, password: 'password' },
      update: {},
    });

    setMockUser({ id: createdUser.id, email: createdUser.email });

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/regulations')
      .send(payload)
      .expect(201);

    const created = asApiResponse<Regulation>(createRes).data;
    expect(created).toHaveProperty('id');
    expect(created.createdById).toBe(createdUser.id);

    const regulationId = created.id;

    // Update
    const updateRes = await request(app.getHttpServer())
      .put(`/regulations/${regulationId}`)
      .send({ title: 'Updated regulation' })
      .expect(200);

    const updated = asApiResponse<Regulation>(updateRes).data;
    expect(updated.title).toBe('Updated regulation');
    expect(updated.updatedById).toBe(createdUser.id);

    // Delete
    await request(app.getHttpServer())
      .delete(`/regulations/${regulationId}`)
      .expect(200);
  });
});
