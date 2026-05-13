import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get, Body, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types';
import { configureHelmet } from '@/main/config/helmet';
import { configureValidation } from '@/main/config/validation';
import { configureBodyParser } from '@/main/config/body-parser';

class TestDto {
  @IsString()
  @MinLength(3)
  name!: string;
}

@Controller('test')
class TestController {
  @Get()
  get() {
    return { ok: true };
  }

  @Post()
  post(@Body() body: TestDto) {
    return body;
  }
}

describe('Security middleware (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    configureHelmet(app);
    configureValidation(app);
    configureBodyParser(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Helmet', () => {
    it('should set X-Content-Type-Options header', async () => {
      const res = await request(app.getHttpServer()).get('/test');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options header', async () => {
      const res = await request(app.getHttpServer()).get('/test');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should remove X-Powered-By header', async () => {
      const res = await request(app.getHttpServer()).get('/test');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('ValidationPipe', () => {
    it('should reject invalid body', async () => {
      const res = await request(app.getHttpServer())
        .post('/test')
        .send({ name: 'ab' });

      expect(res.status).toBe(400);
    });

    it('should accept valid body', async () => {
      const res = await request(app.getHttpServer())
        .post('/test')
        .send({ name: 'abc' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ name: 'abc' });
    });

    it('should strip unknown properties (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/test')
        .send({ name: 'abc', hacked: true });

      expect(res.status).toBe(400);
    });
  });

  describe('Body parser', () => {
    it('should reject payloads larger than 100kb', async () => {
      const largeBody = { name: 'a'.repeat(200_000) };
      const res = await request(app.getHttpServer())
        .post('/test')
        .send(largeBody);

      expect(res.status).toBe(413);
    });
  });
});
