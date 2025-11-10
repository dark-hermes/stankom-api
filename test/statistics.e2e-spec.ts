/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Statistic, StatisticCategory } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('Statistics CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    app = moduleFixture.createNestApplication();
    app.useGlobalGuards(new MockAuthGuard());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform CRUD for Statistic and Category', async () => {
    const userEmail = `e2e-statistics-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: {
        name: 'E2E Statistics User',
        email: userEmail,
        password: 'password',
      },
      update: {},
    });

    setMockUser({ id: createdUser.id, email: createdUser.email });

    // create category
    const createCatRes = await request(app.getHttpServer())
      .post('/statistics/categories')
      .send({ name: 'Test Category' })
      .expect(201);

    const category = asApiResponse<StatisticCategory>(createCatRes).data;
    expect(category).toHaveProperty('id');

    // create statistic
    const payload = {
      name: 'Visitors',
      number: 1234,
      categoryId: category.id,
    };

    const createStatRes = await request(app.getHttpServer())
      .post('/statistics')
      .send(payload)
      .expect(201);

    const stat = asApiResponse<Statistic>(createStatRes).data;
    expect(stat).toHaveProperty('id');

    const id = stat.id;

    // get category by id and expect statistic relation present
    const getCatRes = await request(app.getHttpServer())
      .get(`/statistics/categories/${category.id}`)
      .expect(200);
    const gotCat = asApiResponse<
      StatisticCategory & { statistics: Statistic[] }
    >(getCatRes).data;
    expect(gotCat).toHaveProperty('id');
    expect(Array.isArray(gotCat.statistics)).toBe(true);
    expect(gotCat.statistics.find((s: Statistic) => s.id === id)).toBeDefined();

    // update statistic
    const updateRes = await request(app.getHttpServer())
      .put(`/statistics/${id}`)
      .send({ number: 4321 })
      .expect(200);

    const updated = asApiResponse<Statistic>(updateRes).data;
    expect(updated.number).toBe(4321);

    // delete statistic
    await request(app.getHttpServer()).delete(`/statistics/${id}`).expect(200);

    // delete category
    await request(app.getHttpServer())
      .delete(`/statistics/categories/${category.id}`)
      .expect(200);
  });
});
