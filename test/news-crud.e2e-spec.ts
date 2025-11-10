/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { News, NewsCategory, Tag } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('News, Category, Tag CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    // Override StorageService to avoid importing ESM-only dependencies (uuid) during tests
    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: () => Promise.resolve(''),
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

  it('should perform CRUD for NewsCategory', async () => {
    const title = `Category ${Date.now()}`;
    const slug = `category-${Date.now()}`;

    const userEmail = `e2e-news-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: { name: 'E2E News User', email: userEmail, password: 'password' },
      update: {},
    });

    setMockUser({ id: createdUser.id, email: createdUser.email });

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/news/categories')
      .send({ title, slug })
      .expect(201);

    const category = asApiResponse<NewsCategory>(createRes).data;
    expect(category).toHaveProperty('id');
    expect(category.title).toBe(title);
    // createdById should be auto-populated by interceptor
    expect(category.createdById).toBe(createdUser.id);

    const categoryId = category.id;

    // Get by id
    const getRes = await request(app.getHttpServer())
      .get(`/news/categories/${categoryId}`)
      .expect(200);
    const got = asApiResponse<NewsCategory>(getRes).data;
    expect(got.id).toBe(categoryId);

    // Update
    const updatedTitle = title + ' - updated';
    const updateRes = await request(app.getHttpServer())
      .put(`/news/categories/${categoryId}`)
      .send({ title: updatedTitle })
      .expect(200);

    const updated = asApiResponse<NewsCategory>(updateRes).data;
    expect(updated.title).toBe(updatedTitle);
    // updatedById should be set for categories
    expect(updated.updatedById).toBe(createdUser.id);

    // Delete
    await request(app.getHttpServer())
      .delete(`/news/categories/${categoryId}`)
      .expect(200);
  });

  it('should perform CRUD for Tag', async () => {
    const name = `Tag ${Date.now()}`;
    const slug = `tag-${Date.now()}`;

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/news/tags')
      .send({ name, slug })
      .expect(201);
    const tag = asApiResponse<Tag>(createRes).data;
    expect(tag).toHaveProperty('id');
    expect(tag.name).toBe(name);

    const tagId = tag.id;

    // Update
    const newName = name + ' updated';
    const updateRes = await request(app.getHttpServer())
      .put(`/news/tags/${tagId}`)
      .send({ name: newName })
      .expect(200);
    expect(asApiResponse<Tag>(updateRes).data.name).toBe(newName);

    // Delete
    await request(app.getHttpServer())
      .delete(`/news/tags/${tagId}`)
      .expect(200);
  });

  it('should perform CRUD for News', async () => {
    // create category and tag for relation
    const cRes = await request(app.getHttpServer())
      .post('/news/categories')
      .send({ title: `TmpCat ${Date.now()}`, slug: `tmpcat-${Date.now()}` })
      .expect(201);
    const categoryId = asApiResponse<NewsCategory>(cRes).data.id;

    const tRes = await request(app.getHttpServer())
      .post('/news/tags')
      .send({ name: `TmpTag ${Date.now()}`, slug: `tmptag-${Date.now()}` })
      .expect(201);
    const tagId = asApiResponse<Tag>(tRes).data.id;

    const payload = {
      title: `E2E News ${Date.now()}`,
      slug: `e2e-news-${Date.now()}`,
      excerpt: 'Short excerpt',
      description: 'Full description',
      image: null,
      status: 'draft',
      categoryId,
      tagIds: [tagId],
    };

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/news')
      .send(payload)
      .expect(201);
    const news = asApiResponse<News>(createRes).data;
    expect(news).toHaveProperty('id');
    const newsId = news.id;

    // Get list
    const listRes = await request(app.getHttpServer()).get('/news').expect(200);
    expect(listRes.body).toBeDefined(); // list endpoint returns paginated shape, keep generic assertion

    // Get list by category id (paginated)
    const byCategoryRes = await request(app.getHttpServer())
      .get(`/news/categories/${categoryId}/news`)
      .expect(200);
    expect(byCategoryRes.body).toBeDefined();

    // Update
    const newTitle = 'Updated News Title';
    const updateRes = await request(app.getHttpServer())
      .put(`/news/${newsId}`)
      .send({ title: newTitle })
      .expect(200);
    expect(asApiResponse<News>(updateRes).data.title).toBe(newTitle);

    // Delete
    await request(app.getHttpServer()).delete(`/news/${newsId}`).expect(200);

    // cleanup
    await request(app.getHttpServer())
      .delete(`/news/categories/${categoryId}`)
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/news/tags/${tagId}`)
      .expect(200);
  });
});
