import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/main/app.module';
import { configureCors } from '@/main/config/cors';
import { configureValidation } from '@/main/config/validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    configureValidation(app);
    configureCors(app);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    await app.listen(port);
    logger.log(`Application listening on port ${port}`);
  } catch (error: unknown) {
    const logger = new Logger('Bootstrap');
    logger.error('Fatal error during bootstrap', error);
    process.exit(1);
  }
}
bootstrap();
