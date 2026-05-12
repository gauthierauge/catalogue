import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function configureCors(app: INestApplication) {
  const configService = app.get(ConfigService);
  const origins = configService
    .get<string>('CORS_ORIGINS', 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600,
  });
}
