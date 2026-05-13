export const BOOK_STOCK_REPOSITORY = Symbol('BOOK_STOCK_REPOSITORY');

export type StockEventStatus =
  | 'RESERVED'
  | 'SUCCESS'
  | 'FAILED';

export type StockOperation = 'increment' | 'decrement';

export type ApplyStockEventInput = {
  idempotencyKey: string;
  paymentId?: string;
  bookId: number;
  status: StockEventStatus;
  quantity: number;
  operation: StockOperation;
  amount: number;
};

export type ApplyStockBatchEventItem = {
  bookId: number;
  quantity: number;
  operation: StockOperation;
  amount: number;
};

export type ApplyStockBatchEventInput = {
  idempotencyKey: string;
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
