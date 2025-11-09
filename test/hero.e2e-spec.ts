/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { HeroSection } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { asApiResponse } from './utils/api-response';
import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('Hero (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({ imports: [AppModule] });

    const uploadFileMock = jest
      .fn()
      .mockResolvedValueOnce('https://storage.example/banner1.png')
      .mockResolvedValueOnce('https://storage.example/banner2.png');
    const deleteFileMock = jest.fn().mockResolvedValue(undefined);

    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: uploadFileMock,
      deleteFile: deleteFileMock,
    });
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleRef: TestingModule = await moduleBuilder.compile();
    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    // seed a user
    const email = 'e2e-hero@test.dev';
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: 'Hero User', password: 'hash' },
    });
    setMockUser({ id: user.id, email: user.email });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get hero and update fields via JSON, then replace banner twice with multipart', async () => {
    // Initial get ensures ensureExists works
    const getRes = await request(app.getHttpServer()).get('/hero').expect(200);
    const initial = asApiResponse<HeroSection>(getRes).data;
    expect(initial).toHaveProperty('id');

    // JSON update (heading only)
    const jsonUpdateRes = await request(app.getHttpServer())
      .put('/hero')
      .send({ heading: 'Updated Heading' })
      .expect(200);
    const jsonUpdated = asApiResponse<HeroSection>(jsonUpdateRes).data;
    expect(jsonUpdated.heading).toBe('Updated Heading');

    // First banner upload
    const firstBannerRes = await request(app.getHttpServer())
      .put('/hero/banner')
      .attach('file', Buffer.from('bannerdata-1'), 'banner1.png')
      .expect(200);
    const firstBanner = asApiResponse<HeroSection>(firstBannerRes).data;
    expect(firstBanner.banner).toBe('https://storage.example/banner1.png');

    // Second banner upload triggers delete of previous
    const secondBannerRes = await request(app.getHttpServer())
      .put('/hero/banner')
      .attach('file', Buffer.from('bannerdata-2'), 'banner2.png')
      .expect(200);
    const secondBanner = asApiResponse<HeroSection>(secondBannerRes).data;
    expect(secondBanner.banner).toBe('https://storage.example/banner2.png');

    const storage = app.get(StorageService);
    const deleteSpy = jest.spyOn(storage, 'deleteFile');
    const uploadSpy = jest.spyOn(storage, 'uploadFile');
    expect(uploadSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(
      'https://storage.example/banner1.png',
    );
  });
});
