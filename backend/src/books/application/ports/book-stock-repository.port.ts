export const BOOK_STOCK_REPOSITORY = Symbol('BOOK_STOCK_REPOSITORY');

export type StockEventStatus =
  | 'RESERVED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'CART_ABANDONED';

export type ApplyStockEventInput = {
  idempotencyKey: string;
  paymentId?: string;
  bookId: number;
  status: StockEventStatus;
  quantity: number;
  delta: number;
};

export type ApplyStockBatchEventItem = {
  bookId: number;
  quantity: number;
  delta: number;
};

export type ApplyStockBatchEventInput = {
  idempotencyKey: string;
  paymentId?: string;
  status: StockEventStatus;
  items: ApplyStockBatchEventItem[];
};

export type ApplyStockEventResult = {
  bookId: number;
  status: StockEventStatus;
  quantity: number;
  alreadyProcessed: boolean;
};

export type ApplyStockBatchEventResult = {
  items: ApplyStockEventResult[];
};

export interface BookStockRepositoryPort {
  applyStockEvent(input: ApplyStockEventInput): Promise<ApplyStockEventResult>;
  applyStockBatchEvent(
    input: ApplyStockBatchEventInput,
  ): Promise<ApplyStockBatchEventResult>;
}
