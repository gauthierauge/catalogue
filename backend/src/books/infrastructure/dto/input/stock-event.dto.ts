import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { StockEventStatus } from '@/books/application/ports/book-stock-repository.port';

export enum StockEventStatusDto {
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
