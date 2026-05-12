export class Price {
    private readonly _value: number;

    private constructor(value: number) {
        this._value = value;
    }

    static create(value: number): Price {
        if (value < 0) {
            throw new Error('Price cannot be negative');
        }
        if (!Number.isFinite(value)) {
            throw new Error('Price must be a valid number');
        }
        return new Price(Math.round(value * 100) / 100);
    }

    get value(): number {
        return this._value;
    }

    equals(other: Price): boolean {
        return this._value === other._value;
    }

    toString(): string {
        return this._value.toFixed(2);
    }
}
