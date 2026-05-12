import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ApplyStockEventInput,
  ApplyStockEventResult,
  BookStockRepositoryPort,
  StockEventStatus,
} from '@/books/application/ports/book-stock-repository.port';
import { PrismaService } from '@/prisma/prisma.service';

type StoredStockEvent = {
  bookId: number;
  status: string;
  resultQuantity: number;
};

@Injectable()
export class PrismaBookStockRepository implements BookStockRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async applyStockEvent(
    input: ApplyStockEventInput,
  ): Promise<ApplyStockEventResult> {
    return this.prisma.$transaction(async (transaction) => {
      const [existingEvent] = await transaction.$queryRaw<StoredStockEvent[]>`
        SELECT "bookId", "status", "resultQuantity"
        FROM "StockEvent"
        WHERE "idempotencyKey" = ${input.idempotencyKey}
        LIMIT 1
      `;

      if (existingEvent) {
        return {
          bookId: existingEvent.bookId,
          status: existingEvent.status as StockEventStatus,
          quantity: existingEvent.resultQuantity,
          alreadyProcessed: true,
        };
      }

      const book = await transaction.book.findUnique({
        where: { id: input.bookId },
        select: {
          id: true,
          quantity: true,
        },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      const nextQuantity = book.quantity + input.delta;

      if (nextQuantity < 0) {
        throw new BadRequestException('Not enough stock available');
      }

      await transaction.book.update({
        where: { id: input.bookId },
        data: { quantity: nextQuantity },
      });

      await transaction.$executeRaw`
        INSERT INTO "StockEvent"
          ("idempotencyKey", "paymentId", "bookId", "status", "quantity", "resultQuantity")
        VALUES
          (${input.idempotencyKey}, ${input.paymentId ?? null}, ${input.bookId}, ${input.status}, ${input.quantity}, ${nextQuantity})
      `;

      return {
        bookId: input.bookId,
        status: input.status,
        quantity: nextQuantity,
        alreadyProcessed: false,
      };
    });
  }
}
