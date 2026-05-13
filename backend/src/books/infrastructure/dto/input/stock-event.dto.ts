import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { StockEventStatus } from '@/books/application/ports/book-stock-repository.port';

export enum StockEventStatusDto {
  RESERVED = 'RESERVED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CART_ABANDONED = 'CART_ABANDONED',
}

export class StockEventDto {
  @ApiPropertyOptional({ description: 'Identifiant du paiement associé' })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiProperty({ enum: StockEventStatusDto, description: 'Statut de l\'événement de stock' })
  @IsEnum(StockEventStatusDto)
  status: StockEventStatus;

  @ApiProperty({ minimum: 1, description: 'Quantité concernée' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ReserveStockDto {
  @ApiProperty({ minimum: 1, description: 'Quantité à réserver' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ReserveStockItemDto {
  @ApiProperty({ minimum: 1, description: 'Identifiant du livre à réserver' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bookId: number;

  @ApiProperty({ minimum: 1, description: 'Quantité à réserver pour ce livre' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ReserveStockBatchDto {
  @ApiProperty({ type: [ReserveStockItemDto], description: 'Livres à réserver' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReserveStockItemDto)
  items: ReserveStockItemDto[];
}
