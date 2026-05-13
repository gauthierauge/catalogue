import {
  Body,
  Controller,
  Headers,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HandleStockEventUseCase } from '@/books/application/use-cases/handle-stock-event.use-case';
import {
  StockEventBatchDto,
} from '@/books/infrastructure/dto/input/stock-event.dto';
import {
  StockEventBatchResponseDto,
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
      status: stockEventBatchDto.status,
      items: stockEventBatchDto.items,
    });
  }
}
