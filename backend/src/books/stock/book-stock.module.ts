import { Module } from '@nestjs/common';
import { BOOK_STOCK_REPOSITORY } from '@/books/stock/application/ports/book-stock-repository.port';
import { HandleStockEventUseCase } from '@/books/stock/application/use-cases/handle-stock-event.use-case';
import { PrismaBookStockRepository } from '@/books/stock/infrastructure/adapters/prisma-book-stock.repository';
import { BookStockController } from '@/books/stock/infrastructure/controllers/book-stock.controller';

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
