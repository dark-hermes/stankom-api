import { INestApplication } from '@nestjs/common';
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { StorageService } from '../src/storage/storage.service';
import { AppModule } from './../src/app.module';

import { MockAuthGuard } from './utils/mock-auth.guard';

describe('News, Category, Tag CRUD (e2e)', () => {
  let app: INestApplication;

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

    // Create
    const createRes = await request(app.getHttpServer())
      .post('/news/categories')
      .send({ title, slug })
      .expect(201);

    expect(createRes.body).toHaveProperty('message');
    expect(createRes.body).toHaveProperty('data');
    const category = createRes.body.data;
    expect(category).toHaveProperty('id');
    expect(category.title).toBe(title);
    // createdById should be auto-populated by interceptor
    expect(category.createdById).toBe(2);

    const categoryId = category.id;

    // Update
    const updatedTitle = title + ' - updated';
    const updateRes = await request(app.getHttpServer())
      .put(`/news/categories/${categoryId}`)
      .send({ title: updatedTitle })
      .expect(200);

    expect(updateRes.body).toHaveProperty('message');
    const updated = updateRes.body.data;
    expect(updated.title).toBe(updatedTitle);
    // updatedById should be set for categories
    expect(updated.updatedById).toBe(2);

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

    const tag = createRes.body.data;
    expect(tag).toHaveProperty('id');
    expect(tag.name).toBe(name);

    const tagId = tag.id;

    // Update
    const newName = name + ' updated';
    const updateRes = await request(app.getHttpServer())
      .put(`/news/tags/${tagId}`)
      .send({ name: newName })
      .expect(200);

    expect(updateRes.body.data.name).toBe(newName);

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
    const categoryId = cRes.body.data.id;

    const tRes = await request(app.getHttpServer())
      .post('/news/tags')
      .send({ name: `TmpTag ${Date.now()}`, slug: `tmptag-${Date.now()}` })
      .expect(201);
    const tagId = tRes.body.data.id;

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

    const news = createRes.body.data;
    expect(news).toHaveProperty('id');
    const newsId = news.id;

    // Get list
    const listRes = await request(app.getHttpServer()).get('/news').expect(200);
    expect(listRes.body).toBeDefined();

    // Update
    const newTitle = 'Updated News Title';
    const updateRes = await request(app.getHttpServer())
      .put(`/news/${newsId}`)
      .send({ title: newTitle })
      .expect(200);

    expect(updateRes.body.data.title).toBe(newTitle);

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
