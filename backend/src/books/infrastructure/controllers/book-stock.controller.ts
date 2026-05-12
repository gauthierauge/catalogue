import {
  Body,
  Controller,
  Headers,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { HandleStockEventUseCase } from '@/books/application/use-cases/handle-stock-event.use-case';
import {
  ReserveStockDto,
  StockEventDto,
} from '@/books/infrastructure/dto/input/stock-event.dto';

@Controller('books')
export class BookStockController {
  constructor(
    private readonly handleStockEventUseCase: HandleStockEventUseCase,
  ) {}

  @Patch(':bookId/stock-events')
  updateStock(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body() stockEventDto: StockEventDto,
  ) {
    return this.handleStockEventUseCase.execute({
      idempotencyKey,
      paymentId: stockEventDto.paymentId,
      bookId,
      status: stockEventDto.status,
      quantity: stockEventDto.quantity,
    });
  }

  @Patch(':bookId/stock/reserve')
  reserveStock(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body() reserveStockDto: ReserveStockDto,
  ) {
    return this.handleStockEventUseCase.execute({
      idempotencyKey,
      bookId,
      status: 'RESERVED',
      quantity: reserveStockDto.quantity,
    });
  }
}
