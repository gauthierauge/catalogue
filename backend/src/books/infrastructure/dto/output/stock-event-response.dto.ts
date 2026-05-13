import { ApiProperty } from '@nestjs/swagger';
import { StockEventStatusDto } from '@/books/infrastructure/dto/input/stock-event.dto';

export class StockEventResponseDto {
    @ApiProperty()
    bookId: number;

    @ApiProperty({ enum: StockEventStatusDto })
    status: StockEventStatusDto;

    @ApiProperty()
    quantity: number;

    @ApiProperty({ description: 'Vrai si l\'événement avait déjà été traité (idempotence)' })
    alreadyProcessed: boolean;
}

export class StockEventBatchResponseDto {
    @ApiProperty({ type: [StockEventResponseDto] })
    items: StockEventResponseDto[];
}
