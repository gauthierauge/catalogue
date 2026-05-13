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

type ReserveStockBatchInput = {
  idempotencyKey?: string;
  status?: StockEventStatus;
  items: {
    bookId: number;
    quantity: number;
  }[];
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

  async executeBatch(input: ReserveStockBatchInput) {
    if (!input.idempotencyKey?.trim()) {
      throw new BadRequestException('Missing x-idempotency-key header');
    }

    if (!input.status) {
      throw new BadRequestException('Missing stock event status');
    }

    const itemsByBookId = new Map<number, number>();

    for (const item of input.items) {
      itemsByBookId.set(
        item.bookId,
        (itemsByBookId.get(item.bookId) ?? 0) + item.quantity,
      );
    }

    return this.stockRepository.applyStockBatchEvent({
      idempotencyKey: input.idempotencyKey.trim(),
      status: input.status,
      items: [...itemsByBookId.entries()].map(([bookId, quantity]) => {
        const { operation, amount } = this.getStockOperation(
          input.status as StockEventStatus,
          quantity,
        );

        return {
          bookId,
          quantity,
          operation,
          amount,
        };
      }),
    });
  }

  async reserveBatch(input: Omit<ReserveStockBatchInput, 'status'>) {
    return this.executeBatch({
      ...input,
      status: 'RESERVED',
    });
  }

  private getStockOperation(
    status: StockEventStatus,
    quantity: number,
  ): { operation: StockOperation; amount: number } {
    if (status === 'RESERVED') {
      return { operation: 'decrement', amount: quantity };
    }

    if (status === 'SUCCESS') {
      return { operation: 'increment', amount: 0 };
    }

    return { operation: 'increment', amount: quantity };
  }
}
