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

  it('should automatically reorder profiles when creating with duplicate order', async () => {
    // Clean up any existing profiles first
    await prisma.directorProfile.deleteMany({});

    // Create first profile with order 1
    const res1 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '1')
      .field('beginYear', '2020')
      .field('name', 'Director 1')
      .field('detail', 'First director')
      .expect(201);
    const profile1 = asApiResponse<DirectorProfile>(res1).data;
    expect(profile1.order).toBe(1);

    // Create second profile with order 2
    const res2 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '2')
      .field('beginYear', '2021')
      .field('name', 'Director 2')
      .field('detail', 'Second director')
      .expect(201);
    const profile2 = asApiResponse<DirectorProfile>(res2).data;
    expect(profile2.order).toBe(2);

    // Create third profile with order 3
    const res3 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '3')
      .field('beginYear', '2022')
      .field('name', 'Director 3')
      .field('detail', 'Third director')
      .expect(201);
    const profile3 = asApiResponse<DirectorProfile>(res3).data;
    expect(profile3.order).toBe(3);

    // Now create a new profile with order 2, should push existing 2 to 3, and 3 to 4
    const res4 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '2')
      .field('beginYear', '2023')
      .field('name', 'Director New')
      .field('detail', 'New director inserted at position 2')
      .expect(201);
    const profile4 = asApiResponse<DirectorProfile>(res4).data;
    expect(profile4.order).toBe(2);

    // Verify all orders
    const allProfiles = await prisma.directorProfile.findMany({
      orderBy: { order: 'asc' },
    });
    expect(allProfiles).toHaveLength(4);
    expect(allProfiles[0].id).toBe(profile1.id);
    expect(allProfiles[0].order).toBe(1);
    expect(allProfiles[1].id).toBe(profile4.id);
    expect(allProfiles[1].order).toBe(2);
    expect(allProfiles[2].id).toBe(profile2.id);
    expect(allProfiles[2].order).toBe(3);
    expect(allProfiles[3].id).toBe(profile3.id);
    expect(allProfiles[3].order).toBe(4);

    // Clean up
    await prisma.directorProfile.deleteMany({});
  });

  it('should automatically reorder profiles when updating order', async () => {
    // Clean up any existing profiles first
    await prisma.directorProfile.deleteMany({});

    // Create three profiles with orders 1, 2, 3
    const res1 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '1')
      .field('beginYear', '2020')
      .field('name', 'Director A')
      .field('detail', 'First')
      .expect(201);
    const profileA = asApiResponse<DirectorProfile>(res1).data;

    const res2 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '2')
      .field('beginYear', '2021')
      .field('name', 'Director B')
      .field('detail', 'Second')
      .expect(201);
    const profileB = asApiResponse<DirectorProfile>(res2).data;

    const res3 = await request(app.getHttpServer())
      .post('/director-profiles')
      .field('order', '3')
      .field('beginYear', '2022')
      .field('name', 'Director C')
      .field('detail', 'Third')
      .expect(201);
    const profileC = asApiResponse<DirectorProfile>(res3).data;

    // Update profile C (order 3) to order 1, should push A to 2 and B to 3
    await request(app.getHttpServer())
      .put(`/director-profiles/${profileC.id}`)
      .field('order', '1')
      .expect(200);

    // Verify all orders
    const allProfiles = await prisma.directorProfile.findMany({
      orderBy: { order: 'asc' },
    });
    expect(allProfiles).toHaveLength(3);
    expect(allProfiles[0].id).toBe(profileC.id);
    expect(allProfiles[0].order).toBe(1);
    expect(allProfiles[1].id).toBe(profileA.id);
    expect(allProfiles[1].order).toBe(2);
    expect(allProfiles[2].id).toBe(profileB.id);
    expect(allProfiles[2].order).toBe(3);

    // Clean up
    await prisma.directorProfile.deleteMany({});
  });
});
