import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ApplyStockBatchEventInput,
  ApplyStockBatchEventResult,
  ApplyStockEventInput,
  ApplyStockEventResult,
  BookStockRepositoryPort,
  StockEventStatus,
} from '@/books/application/ports/book-stock-repository.port';
import { PrismaService } from '@/prisma/prisma.service';

type StoredStockEvent = {
  bookId: number;
  status: string;
  quantity: number;
  resultQuantity: number;
};

type UpdatedStock = {
  quantity: number;
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

  async applyStockBatchEvent(
    input: ApplyStockBatchEventInput,
  ): Promise<ApplyStockBatchEventResult> {
    return this.prisma.$transaction(async (transaction) => {
      const eventKeys = input.items.map((item) =>
        this.buildBatchIdempotencyKey(input.idempotencyKey, item.bookId),
      );

      const existingEvents: StoredStockEvent[] = [];

      for (const eventKey of eventKeys) {
        const [existingEvent] = await transaction.$queryRaw<StoredStockEvent[]>`
          SELECT "bookId", "status", "quantity", "resultQuantity"
          FROM "StockEvent"
          WHERE "idempotencyKey" = ${eventKey}
          LIMIT 1
        `;

        if (existingEvent) {
          existingEvents.push(existingEvent);
        }
      }

      if (existingEvents.length > 0) {
        if (existingEvents.length !== input.items.length) {
          throw new BadRequestException(
            'Idempotency key already used for a partial stock batch',
          );
        }

        const eventsByBookId = new Map(
          existingEvents.map((event) => [event.bookId, event]),
        );

        return {
          items: input.items.map((item) => {
            const existingEvent = eventsByBookId.get(item.bookId);

            if (!existingEvent) {
              throw new BadRequestException(
                'Idempotency key already used for a different stock batch',
              );
            }

            return {
              bookId: existingEvent.bookId,
              status: existingEvent.status as StockEventStatus,
              quantity: existingEvent.resultQuantity,
              alreadyProcessed: true,
            };
          }),
        };
      }

      const results: ApplyStockEventResult[] = [];

      for (const item of input.items) {
        const [updatedStock] = await transaction.$queryRaw<UpdatedStock[]>`
          UPDATE "Book"
          SET "quantity" = "quantity" + ${item.delta}
          WHERE "id" = ${item.bookId}
            AND "quantity" + ${item.delta} >= 0
          RETURNING "quantity"
        `;

        if (!updatedStock) {
          const book = await transaction.book.findUnique({
            where: { id: item.bookId },
            select: { id: true },
          });

          if (!book) {
            throw new NotFoundException(`Book ${item.bookId} not found`);
          }

          throw new BadRequestException(
            `Not enough stock available for book ${item.bookId}`,
          );
        }

        await transaction.$executeRaw`
          INSERT INTO "StockEvent"
            ("idempotencyKey", "paymentId", "bookId", "status", "quantity", "resultQuantity")
          VALUES
            (${this.buildBatchIdempotencyKey(input.idempotencyKey, item.bookId)}, ${null}, ${item.bookId}, ${input.status}, ${item.quantity}, ${updatedStock.quantity})
        `;

        results.push({
          bookId: item.bookId,
          status: input.status,
          quantity: updatedStock.quantity,
          alreadyProcessed: false,
        });
      }

      return { items: results };
    });
  }

  private buildBatchIdempotencyKey(idempotencyKey: string, bookId: number) {
    return `${idempotencyKey}:${bookId}`;
  }
}
