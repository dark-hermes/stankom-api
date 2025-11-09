/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { RolesResponsibilities } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { asApiResponse } from './utils/api-response';
import { MockAuthGuard, setMockUser } from './utils/mock-auth.guard';

describe('RolesResponsibilities (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    // Override JwtAuthGuard so requests are authenticated in tests and request.user is set
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleRef: TestingModule = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    prisma = app.get(PrismaService);

    // Upsert user for auth guard context
    const email = 'e2e-rr@test.dev';
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: 'RR User', password: 'hash' },
    });
    setMockUser({ id: user.id, email: user.email }); // mock guard will read this

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get and update roles-responsibilities', async () => {
    // GET initial (seed ensures exists or service creates)
    const getRes = await request(app.getHttpServer())
      .get('/roles-responsibilities')
      .expect(200);
    const initial = asApiResponse<RolesResponsibilities>(getRes);
    expect(initial.data).toHaveProperty('id');

    // PUT update
    const payload = {
      roles: 'Updated Roles',
      responsibilities: 'Updated Responsibilities',
    };
    const putRes = await request(app.getHttpServer())
      .put('/roles-responsibilities')
      .send(payload)
      .expect(200);
    const updated = asApiResponse<RolesResponsibilities>(putRes);
    expect(updated.data.roles).toBe('Updated Roles');
    expect(updated.data.responsibilities).toBe('Updated Responsibilities');
  });
});
