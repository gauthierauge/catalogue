import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  BOOK_STOCK_REPOSITORY,
  BookStockRepositoryPort,
  StockEventStatus,
} from '@/books/stock/application/ports/book-stock-repository.port';

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

    const delta = this.getStockDelta(input.status, input.quantity);

    return this.stockRepository.applyStockEvent({
      idempotencyKey: input.idempotencyKey.trim(),
      paymentId: input.paymentId,
      bookId: input.bookId,
      status: input.status,
      quantity: input.quantity,
      delta,
    });
  }

  private getStockDelta(status: StockEventStatus, quantity: number): number {
    if (status === 'PAYMENT_PENDING' || status === 'PAYMENT_SUCCESS') {
      return -quantity;
    }

    return quantity;
  }
}
