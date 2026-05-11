import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '@/main/app.module';

describe('App (smoke)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should start without crashing', () => {
    expect(app).toBeDefined();
  });

  it('GET / should return 200', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });

  it('GET /nonexistent should return 404', () => {
    return request(app.getHttpServer()).get('/nonexistent').expect(404);
  });

  it('GET / should return correct Content-Type', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect('Content-Type', /text\/html/);
  });
});
