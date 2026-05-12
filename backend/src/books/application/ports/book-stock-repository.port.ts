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

export type ApplyStockEventResult = {
  bookId: number;
  status: StockEventStatus;
  quantity: number;
  alreadyProcessed: boolean;
};

export interface BookStockRepositoryPort {
  applyStockEvent(input: ApplyStockEventInput): Promise<ApplyStockEventResult>;
}
