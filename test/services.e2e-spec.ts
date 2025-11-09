/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Service as ServiceModel } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('Services CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    // Override StorageService to avoid importing ESM-only dependencies during tests
    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: () => Promise.resolve('https://storage.example/icon.png'),
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

  it('should perform CRUD for Service', async () => {
    const payload = {
      title: `E2E Service ${Date.now()}`,
      description: 'E2E service description',
      link: null,
      icon: 'ic_service_default', // icon is now a string value provided by the icon service
    };

    // Ensure a user exists that will be used as createdBy via MockAuthGuard (id = 2)
    // Create a fresh user and use its id via the MockAuthGuard behavior
    // Create a fresh user and tell the MockAuthGuard to use that user
    const userEmail = `e2e-services-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: {
        name: 'E2E Service User',
        email: userEmail,
        password: 'password',
      },
      update: {},
    });

    // set the mock guard to use the created user's id so Prisma nested connect works
    setMockUser({ id: createdUser.id, email: createdUser.email });

    // Create sending JSON body (icon is a string). The AuditInterceptor will inject createdById from the guard.
    const createRes = await request(app.getHttpServer())
      .post('/services')
      .send(payload)
      .expect(201);

    const service = asApiResponse<ServiceModel>(createRes).data;
    expect(service).toHaveProperty('id');
    // createdById should be auto-populated by interceptor to the mock user id
    expect(service.createdById).toBe(createdUser.id);

    const id = service.id;

    // Update (send no file)
    const updateRes = await request(app.getHttpServer())
      .put(`/services/${id}`)
      .send({ title: 'Updated Service' })
      .expect(200);

    const updated = asApiResponse<ServiceModel>(updateRes).data;
    expect(updated.title).toBe('Updated Service');
    expect(updated.updatedById).toBe(createdUser.id);

    // Delete
    await request(app.getHttpServer()).delete(`/services/${id}`).expect(200);
  });
});
