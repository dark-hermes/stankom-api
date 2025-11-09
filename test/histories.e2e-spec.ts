/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { History } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';
import { MockAuthGuard } from './utils/mock-auth.guard';

describe('Histories CRUD (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalGuards(new MockAuthGuard());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform CRUD for History', async () => {
    const payload = {
      year: 2001,
      description: 'Company founded',
      detail: 'We started operations in 2001',
    };

    const createRes = await request(app.getHttpServer())
      .post('/histories')
      .send(payload)
      .expect(201);

    const history = asApiResponse<History>(createRes).data;
    expect(history).toHaveProperty('id');

    const id = history.id;

    const updateRes = await request(app.getHttpServer())
      .put(`/histories/${id}`)
      .send({ description: 'Updated desc' })
      .expect(200);

    const updated = asApiResponse<History>(updateRes).data;
    expect(updated.description).toBe('Updated desc');

    await request(app.getHttpServer()).delete(`/histories/${id}`).expect(200);
  });
});
