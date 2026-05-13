export class Stock {
    private readonly _quantity: number;

    private constructor(quantity: number) {
        this._quantity = quantity;
    }

    static create(quantity: number): Stock {
        if (quantity < 0) {
            throw new Error('Stock quantity cannot be negative');
        }
        if (!Number.isInteger(quantity)) {
            throw new Error('Stock quantity must be an integer');
        }
        return new Stock(quantity);
    }

    get quantity(): number {
        return this._quantity;
    }

    increment(amount: number): Stock {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new Error('Increment amount must be a non-negative integer');
        }
        return new Stock(this._quantity + amount);
    }

    decrement(amount: number): Stock {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new Error('Decrement amount must be a non-negative integer');
        }
        if (this._quantity - amount < 0) {
            throw new Error('Not enough stock available');
        }
        return new Stock(this._quantity - amount);
    }

    isAvailable(): boolean {
        return this._quantity > 0;
    }

    equals(other: Stock): boolean {
        return this._quantity === other._quantity;
    }

    toString(): string {
        return this._quantity.toString();
    }
}
