/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Faq } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('FAQ CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
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

  it('should perform CRUD for FAQ', async () => {
    const payload = {
      question: `E2E Question ${Date.now()}`,
      answer: 'E2E Answer',
    };

    const userEmail = `e2e-faq-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: { name: 'E2E FAQ User', email: userEmail, password: 'password' },
      update: {},
    });

    setMockUser({ id: createdUser.id, email: createdUser.email });

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/faq')
      .send(payload)
      .expect(201);

    const faq = asApiResponse<Faq>(createRes).data;
    expect(faq).toHaveProperty('id');
    // createdById should be auto-populated by interceptor to the mock user id
    expect(faq.createdById).toBe(createdUser.id);

    const faqId = faq.id;

    // Update
    const updateRes = await request(app.getHttpServer())
      .put(`/faq/${faqId}`)
      .send({ question: 'Updated question' })
      .expect(200);

    const updated = asApiResponse<Faq>(updateRes).data;
    expect(updated.question).toBe('Updated question');
    // updatedById should be set by interceptor
    expect(updated.updatedById).toBe(createdUser.id);

    // Delete
    await request(app.getHttpServer()).delete(`/faq/${faqId}`).expect(200);
  });
});
