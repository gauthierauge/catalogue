import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { StockEventStatus } from '@/books/application/ports/book-stock-repository.port';

export enum StockEventStatusDto {
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CART_ABANDONED = 'CART_ABANDONED',
}

export class StockEventDto {
  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsEnum(StockEventStatusDto)
  status: StockEventStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class ReserveStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
