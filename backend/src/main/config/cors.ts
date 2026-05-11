import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function configureCors(app: INestApplication) {
  const configService = app.get(ConfigService);
  const origin = configService.get<string>('CORS_ORIGIN', 'http://localhost:5173');

  app.enableCors({
    origin,
  });
}
