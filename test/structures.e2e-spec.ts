/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Structure } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { StorageService } from '../src/storage/storage.service';
import { asApiResponse } from './utils/api-response';
import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('Structures (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    const uploadFileMock = jest
      .fn()
      .mockResolvedValueOnce('https://storage.example/structure1.png')
      .mockResolvedValueOnce('https://storage.example/structure2.png');
    const deleteFileMock = jest.fn().mockResolvedValue(undefined);

    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: uploadFileMock,
      deleteFile: deleteFileMock,
    });

    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleRef: TestingModule = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    const email = 'e2e-structures@test.dev';
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: 'Structures User', password: 'hash' },
    });
    setMockUser({ id: user.id, email: user.email });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get and update structure (JSON)', async () => {
    const getRes = await request(app.getHttpServer())
      .get('/structures')
      .expect(200);
    const initial = asApiResponse<Structure>(getRes);
    expect(initial.data).toHaveProperty('id');

    const putRes = await request(app.getHttpServer())
      .put('/structures')
      .send({ image: 'https://example.com/new-structure.png' })
      .expect(200);
    const updated = asApiResponse<Structure>(putRes);
    expect(updated.data.image).toBe('https://example.com/new-structure.png');
  });

  it('should update structure via multipart file upload and replace previous image', async () => {
    // First multipart upload
    const firstRes = await request(app.getHttpServer())
      .put('/structures')
      .attach('file', Buffer.from('filedata-1'), 'structure1.png')
      .expect(200);
    const first = asApiResponse<Structure>(firstRes).data;
    expect(first.image).toBe('https://storage.example/structure1.png');

    // Second multipart upload triggers delete of previous image and sets new image
    const secondRes = await request(app.getHttpServer())
      .put('/structures')
      .attach('file', Buffer.from('filedata-2'), 'structure2.png')
      .expect(200);
    const second = asApiResponse<Structure>(secondRes).data;
    expect(second.image).toBe('https://storage.example/structure2.png');

    // Access the overridden provider to assert mocks
    const storage = app.get<StorageService>(StorageService);
    const uploadSpy = jest.spyOn(storage, 'uploadFile');
    const deleteSpy = jest.spyOn(storage, 'deleteFile');
    // uploadFile should have been called twice and deleteFile once
    expect(uploadSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    // deleteFile should have been called with the previous image URL
    expect(deleteSpy).toHaveBeenCalledWith(
      'https://storage.example/structure1.png',
    );
  });
});
