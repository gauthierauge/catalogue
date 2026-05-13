import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { BOOK_STOCK_REPOSITORY } from '@/books/application/ports/book-stock-repository.port';
import type {
  BookStockRepositoryPort,
  StockEventStatus,
  StockOperation,
} from '@/books/application/ports/book-stock-repository.port';

type HandleStockEventInput = {
  idempotencyKey?: string;
  paymentId?: string;
  bookId: number;
  status: StockEventStatus;
  quantity: number;
};

@Injectable()
export class HandleStockEventUseCase {
  constructor(
    @Inject(BOOK_STOCK_REPOSITORY)
    private readonly stockRepository: BookStockRepositoryPort,
  ) {}

  async execute(input: HandleStockEventInput) {
    if (!input.idempotencyKey?.trim()) {
      throw new BadRequestException('Missing x-idempotency-key header');
    }

    const { operation, amount } = this.getStockOperation(input.status, input.quantity);

    return this.stockRepository.applyStockEvent({
      idempotencyKey: input.idempotencyKey.trim(),
      paymentId: input.paymentId,
      bookId: input.bookId,
      status: input.status,
      quantity: input.quantity,
      operation,
      amount,
    });
  }

  private getStockOperation(
    status: StockEventStatus,
    quantity: number,
  ): { operation: StockOperation; amount: number } {
    if (
      status === 'RESERVED' ||
      status === 'PAYMENT_PENDING' ||
      status === 'PAYMENT_SUCCESS'
    ) {
      return { operation: 'decrement', amount: quantity };
    }

    return { operation: 'increment', amount: quantity };
  }
}
