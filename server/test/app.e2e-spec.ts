import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface HealthResponseBody {
  status: string;
  service: string;
  timestamp: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }) => {
        const health = body as HealthResponseBody;
        expect(body).toMatchObject({
          status: 'ok',
          service: 'CineMate API',
        });
        expect(health.timestamp).toEqual(expect.any(String));
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
