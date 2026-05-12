import {
  Body,
  Controller,
  Headers,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { HandleStockEventUseCase } from '@/books/stock/application/use-cases/handle-stock-event.use-case';
import { StockEventDto } from '@/books/stock/infrastructure/dto/stock-event.dto';

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
}
