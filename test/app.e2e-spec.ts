import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt.guard';
import { StorageService } from '../src/storage/storage.service';
import { AppModule } from './../src/app.module';
import { MockAuthGuard } from './utils/mock-auth.guard';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    moduleBuilder.overrideProvider(StorageService).useValue({
      uploadFile: () => Promise.resolve(''),
      deleteFile: () => Promise.resolve(),
    });

    // Ensure JwtAuthGuard is overridden so tests can set request.user
    moduleBuilder.overrideGuard(JwtAuthGuard).useValue(new MockAuthGuard());

    const moduleFixture: TestingModule = await moduleBuilder.compile();

    app = moduleFixture.createNestApplication();
    // also set global guard
    app.useGlobalGuards(new MockAuthGuard());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toBeDefined();
        expect(res.body).toHaveProperty('status', 'ok');
      });
  });
});
