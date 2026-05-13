import { Module } from '@nestjs/common';
import { BOOK_STOCK_REPOSITORY } from '@/books/application/ports/book-stock-repository.port';
import { HandleStockEventUseCase } from '@/books/application/use-cases/handle-stock-event.use-case';
import { PrismaBookStockRepository } from '@/books/infrastructure/adapters/prisma-book-stock.repository';
import { BookStockController } from '@/books/infrastructure/controllers/book-stock.controller';

@Module({
  controllers: [BookStockController],
  providers: [
    HandleStockEventUseCase,
    {
      provide: BOOK_STOCK_REPOSITORY,
      useClass: PrismaBookStockRepository,
    },
  ],
})
export class BookStockModule {}
