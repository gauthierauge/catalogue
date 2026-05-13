import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/main/app.module';
import { configureBodyParser } from '@/main/config/body-parser';
import { configureCors } from '@/main/config/cors';
import { configureHelmet } from '@/main/config/helmet';
import { configureValidation } from '@/main/config/validation';
import { GlobalExceptionFilter } from '@/main/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  try {

    configureHelmet(app);
    configureValidation(app);
    configureCors(app);
    configureBodyParser(app);

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.setGlobalPrefix('api');

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);
    logger.log(`Application listening on port ${port}`);
  } catch (error: unknown) {
    logger.error('Fatal error during bootstrap', error);
    process.exit(1);
  }
}
bootstrap();
