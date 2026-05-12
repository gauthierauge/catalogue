import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AppLoggerModule } from '@/main/config/logger.module';
import { AppThrottlerModule } from '@/main/config/throttler.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { BooksModule } from '@/books/books.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppLoggerModule,
    AppThrottlerModule,
    PrismaModule,
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
