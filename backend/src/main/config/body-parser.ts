import { INestApplication } from '@nestjs/common';
import { json } from 'express';

export function configureBodyParser(app: INestApplication) {
  app.use(json({ limit: '100kb' }));
}
