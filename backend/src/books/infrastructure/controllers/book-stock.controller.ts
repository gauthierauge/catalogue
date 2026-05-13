import {
  Body,
  Controller,
  Headers,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HandleStockEventUseCase } from '@/books/application/use-cases/handle-stock-event.use-case';
import {
  ReserveStockBatchDto,
  ReserveStockDto,
  StockEventBatchDto,
  StockEventDto,
} from '@/books/infrastructure/dto/input/stock-event.dto';
import {
  StockEventBatchResponseDto,
  StockEventResponseDto,
} from '@/books/infrastructure/dto/output/stock-event-response.dto';

@ApiTags('Stock')
@Controller('books')
export class BookStockController {
  constructor(
    private readonly handleStockEventUseCase: HandleStockEventUseCase,
  ) {}

  @Patch('stock-events')
  @ApiOperation({ summary: 'Appliquer un événement de stock sur plusieurs livres' })
  @ApiResponse({ status: 200, type: StockEventBatchResponseDto })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 404, description: 'Livre non trouvé' })
  updateBatchStock(
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body() stockEventBatchDto: StockEventBatchDto,
  ) {
    return this.handleStockEventUseCase.executeBatch({
      idempotencyKey,
      paymentId: stockEventBatchDto.paymentId,
      status: stockEventBatchDto.status,
      items: stockEventBatchDto.items,
    });
  }

  @Patch(':bookId/stock-events')
  @ApiOperation({ summary: 'Appliquer un événement de stock sur un livre' })
  @ApiResponse({ status: 200, type: StockEventResponseDto })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 404, description: 'Livre non trouvé' })
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

  @Patch('stock/reserve')
  @ApiOperation({ summary: 'Réserver du stock pour plusieurs livres' })
  @ApiResponse({ status: 200, type: StockEventBatchResponseDto })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 404, description: 'Livre non trouvé' })
  reserveBatchStock(
    @Headers('x-idempotency-key') idempotencyKey: string | undefined,
    @Body() reserveStockBatchDto: ReserveStockBatchDto,
  ) {
    return this.handleStockEventUseCase.reserveBatch({
      idempotencyKey,
      items: reserveStockBatchDto.items,
    });
  }

  @Patch(':bookId/stock/reserve')
  @ApiOperation({ summary: 'Réserver du stock pour un livre' })
  @ApiResponse({ status: 200, type: StockEventResponseDto })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 404, description: 'Livre non trouvé' })
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
