import { Stock } from './stock.vo';

describe('Stock', () => {
  describe('create()', () => {
    it('creates a Stock with a valid quantity', () => {
      const stock = Stock.create(10);
      expect(stock.quantity).toBe(10);
    });

    it('creates a Stock with quantity 0', () => {
      const stock = Stock.create(0);
      expect(stock.quantity).toBe(0);
    });

    it('throws when quantity is negative', () => {
      expect(() => Stock.create(-1)).toThrow('Stock quantity cannot be negative');
    });

    it('throws when quantity is not an integer', () => {
      expect(() => Stock.create(1.5)).toThrow('Stock quantity must be an integer');
    });
  });

  describe('increment()', () => {
    it('returns a new Stock with the incremented quantity', () => {
      const stock = Stock.create(5);
      const result = stock.increment(3);
      expect(result.quantity).toBe(8);
    });

    it('returns a new Stock instance (immutability)', () => {
      const stock = Stock.create(5);
      const result = stock.increment(3);
      expect(result).not.toBe(stock);
      expect(stock.quantity).toBe(5);
    });

    it('accepts 0 as a no-op increment', () => {
      const stock = Stock.create(5);
      expect(stock.increment(0).quantity).toBe(5);
    });

    it('throws when amount is negative', () => {
      const stock = Stock.create(5);
      expect(() => stock.increment(-1)).toThrow('Increment amount must be a non-negative integer');
    });

    it('throws when amount is not an integer', () => {
      const stock = Stock.create(5);
      expect(() => stock.increment(1.5)).toThrow('Increment amount must be a non-negative integer');
    });
  });

  describe('decrement()', () => {
    it('returns a new Stock with the decremented quantity', () => {
      const stock = Stock.create(10);
      const result = stock.decrement(4);
      expect(result.quantity).toBe(6);
    });

    it('returns a new Stock instance (immutability)', () => {
      const stock = Stock.create(10);
      const result = stock.decrement(4);
      expect(result).not.toBe(stock);
      expect(stock.quantity).toBe(10);
    });

    it('decrements to exactly 0', () => {
      const stock = Stock.create(5);
      expect(stock.decrement(5).quantity).toBe(0);
    });

    it('accepts 0 as a no-op decrement', () => {
      const stock = Stock.create(5);
      expect(stock.decrement(0).quantity).toBe(5);
    });

    it('throws when result would be negative', () => {
      const stock = Stock.create(3);
      expect(() => stock.decrement(4)).toThrow('Not enough stock available');
    });

    it('throws when amount is negative', () => {
      const stock = Stock.create(5);
      expect(() => stock.decrement(-1)).toThrow('Decrement amount must be a non-negative integer');
    });

    it('throws when amount is not an integer', () => {
      const stock = Stock.create(5);
      expect(() => stock.decrement(1.5)).toThrow('Decrement amount must be a non-negative integer');
    });
  });

  describe('isAvailable()', () => {
    it('returns true when quantity is greater than 0', () => {
      expect(Stock.create(1).isAvailable()).toBe(true);
    });

    it('returns false when quantity is 0', () => {
      expect(Stock.create(0).isAvailable()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('returns true for two stocks with the same quantity', () => {
      expect(Stock.create(5).equals(Stock.create(5))).toBe(true);
    });

    it('returns false for two stocks with different quantities', () => {
      expect(Stock.create(5).equals(Stock.create(6))).toBe(false);
    });
  });

  describe('toString()', () => {
    it('returns the quantity as a string', () => {
      expect(Stock.create(7).toString()).toBe('7');
    });
  });
});