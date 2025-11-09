/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { DirectorProfile } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { asApiResponse } from './utils/api-response';
import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('DirectorProfiles (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({ imports: [AppModule] });

    const uploadFileMock = jest
      .fn()
      .mockResolvedValueOnce('https://storage.example/director1.png')
      .mockResolvedValueOnce('https://storage.example/director2.png');
    const deleteFileMock = jest.fn().mockResolvedValue(undefined);

    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: uploadFileMock,
      deleteFile: deleteFileMock,
    });
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleRef: TestingModule = await moduleBuilder.compile();
    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    // Ensure a user exists for any AuditInterceptor usage
    const email = 'e2e-director@test.dev';
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: 'Director User', password: 'hash' },
    });
    setMockUser({ id: user.id, email: user.email });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create, list, update (multipart), and delete a director profile', async () => {
    // Create with multipart file
    const createRes = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '1')
      .field('beginYear', '2020')
      .field('name', 'Jane Doe')
      .field('detail', 'Desc')
      .attach('file', Buffer.from('filedata-1'), 'director1.png')
      .expect(201);
    const created = asApiResponse<DirectorProfile>(createRes).data;
    expect(created).toHaveProperty('id');
    expect(created.picture).toBe('https://storage.example/director1.png');
    // endYear should default to current year if omitted
    expect(created.endYear).toBe(new Date().getFullYear());

    const id = created.id;

    // List
    const listRes = await request(app.getHttpServer())
      .get('/director-profiles')
      .expect(200);
    expect(listRes.body).toBeDefined();

    // Update with new file and null endYear to re-default
    const updateRes = await request(app.getHttpServer())
      .put(`/director-profiles/${id}`)
      .field('order', '2')
      .field('endYear', '')
      .attach('file', Buffer.from('filedata-2'), 'director2.png')
      .expect(200);
    const updated = asApiResponse<DirectorProfile>(updateRes).data;
    expect(updated.picture).toBe('https://storage.example/director2.png');
    expect(updated.endYear).toBe(new Date().getFullYear());

    // Delete
    await request(app.getHttpServer())
      .delete(`/director-profiles/${id}`)
      .expect(200);

    // Verify storage delete called twice: once on update (old picture) and once on remove
    const storage = app.get(StorageService);
    const deleteSpy = jest.spyOn(storage, 'deleteFile');
    expect(deleteSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenNthCalledWith(
      1,
      'https://storage.example/director1.png',
    );
    expect(deleteSpy).toHaveBeenNthCalledWith(
      2,
      'https://storage.example/director2.png',
    );
  });
});
