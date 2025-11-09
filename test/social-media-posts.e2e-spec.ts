/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { SocialMediaPost } from '@prisma/client';
import request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from './../src/app.module';
import { asApiResponse } from './utils/api-response';

import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('SocialMediaPosts CRUD (e2e)', () => {
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

  it('should perform CRUD for SocialMediaPost', async () => {
    const payload = {
      platform: 'INSTAGRAM',
      postLink: `https://example.com/p/${Date.now()}`,
      image: 'https://example.com/image.png',
    };

    const userEmail = `e2e-social-media-post-${Date.now()}@example.com`;
    const createdUser = await prisma.user.upsert({
      where: { email: userEmail },
      create: {
        name: 'E2E SocialMedia User',
        email: userEmail,
        password: 'password',
      },
      update: {},
    });

    setMockUser({ id: createdUser.id, email: createdUser.email });

    const createRes = await request(app.getHttpServer())
      .post('/social-media-posts')
      .send(payload)
      .expect(201);

    const post = asApiResponse<SocialMediaPost>(createRes).data;
    expect(post).toHaveProperty('id');
    expect(post.createdById).toBe(createdUser.id);

    const id = post.id;

    const updateRes = await request(app.getHttpServer())
      .put(`/social-media-posts/${id}`)
      .send({ postLink: 'https://example.com/updated' })
      .expect(200);

    const updated = asApiResponse<SocialMediaPost>(updateRes).data;
    expect(updated.postLink).toBe('https://example.com/updated');
    expect(updated.updatedById).toBe(createdUser.id);

    await request(app.getHttpServer())
      .delete(`/social-media-posts/${id}`)
      .expect(200);
  });
});
