import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function configureHelmet(app: INestApplication) {
  app.use(helmet());
}
