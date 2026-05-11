import { INestApplication } from '@nestjs/common';

export function configureCors(app: INestApplication) {
  app.enableCors({
    origin: 'http://localhost:5173',
  });
}
