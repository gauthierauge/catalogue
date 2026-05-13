import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppLoggerModule } from '@/main/config/logger.module';
import { AppThrottlerModule } from '@/main/config/throttler.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { BooksModule } from '@/books/books.module';
import { LoggerModule } from '@/common/logger/logger.module';
import { LoggerMiddleware } from '@/common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    AppLoggerModule,
    AppThrottlerModule,
    PrismaModule,
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
