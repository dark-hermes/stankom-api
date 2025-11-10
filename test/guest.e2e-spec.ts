import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import type { Response } from 'supertest';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Guest / Public API (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // Avoid passing `any` to request(); cast to http.Server to satisfy lint rules
    server = app.getHttpServer() as unknown as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/public/news (GET)', () => {
    it('should return paginated published news without auth', () => {
      return request(server)
        .get('/public/news')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as {
            data: unknown;
            meta?: unknown;
            links?: unknown;
          };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(body).toHaveProperty('links');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/news/categories (GET)', () => {
    it('should return paginated news categories without auth', () => {
      return request(server)
        .get('/public/news/categories')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/announcements (GET)', () => {
    it('should return paginated announcements without auth', () => {
      return request(server)
        .get('/public/announcements')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/galleries (GET)', () => {
    it('should return paginated galleries without auth', () => {
      return request(server)
        .get('/public/galleries')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/faq (GET)', () => {
    it('should return paginated FAQs without auth', () => {
      return request(server)
        .get('/public/faq')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/hero (GET)', () => {
    it('should return hero section without auth', () => {
      return request(server)
        .get('/public/hero')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as {
            data?: unknown;
            message?: string;
          };
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('data');
        });
    });
  });

  describe('/public/histories (GET)', () => {
    it('should return paginated histories without auth', () => {
      return request(server)
        .get('/public/histories')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/roles-responsibilities (GET)', () => {
    it('should return roles and responsibilities without auth', () => {
      return request(server)
        .get('/public/roles-responsibilities')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as {
            data?: unknown;
            message?: string;
          };
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('data');
        });
    });
  });

  describe('/public/services (GET)', () => {
    it('should return paginated services without auth', () => {
      return request(server)
        .get('/public/services')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/social-media-posts (GET)', () => {
    it('should return paginated social media posts without auth', () => {
      return request(server)
        .get('/public/social-media-posts')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/social-medias (GET)', () => {
    it('should return paginated social medias without auth', () => {
      return request(server)
        .get('/public/social-medias')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/statistics/categories (GET)', () => {
    it('should return paginated statistic categories without auth', () => {
      return request(server)
        .get('/public/statistics/categories')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/statistics (GET)', () => {
    it('should return paginated statistics without auth', () => {
      return request(server)
        .get('/public/statistics')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });

  describe('/public/structure (GET)', () => {
    it('should return organizational structure without auth', () => {
      return request(server)
        .get('/public/structure')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as {
            data?: unknown;
            message?: string;
          };
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('data');
        });
    });
  });

  describe('/public/director-profiles (GET)', () => {
    it('should return paginated director profiles without auth', () => {
      return request(server)
        .get('/public/director-profiles')
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as unknown as { data: unknown; meta?: unknown };
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('meta');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });
  });
});
