import { Price } from '../value-objects/price.vo';
import { Stock } from '../value-objects/stock.vo';
import { Author } from './author.model';

export enum BookType {
    NOVEL = 'NOVEL',
    COMIC = 'COMIC',
    MANGA = 'MANGA',
    ESSAY = 'ESSAY',
    BIOGRAPHY = 'BIOGRAPHY',
    MANUAL = 'MANUAL',
}

export enum BookGenre {
    SCIENCE_FICTION = 'SCIENCE_FICTION',
    FANTASY = 'FANTASY',
    CRIME = 'CRIME',
    ROMANCE = 'ROMANCE',
    HORROR = 'HORROR',
    ADVENTURE = 'ADVENTURE',
    HISTORY = 'HISTORY',
    YOUNG_ADULT = 'YOUNG_ADULT',
    CHILDREN = 'CHILDREN',
    NON_FICTION = 'NON_FICTION',
}

export class Book {
    constructor(
        public readonly id: number,
        public readonly title: string,
        public readonly isbn: string,
        public readonly type: BookType,
        public readonly genre: BookGenre,
        public readonly price: Price,
        public readonly stock: Stock,
        public readonly authors: Author[],
        public readonly description?: string,
        public readonly publisherName?: string,
        public readonly publicationDate?: Date,
    ) { }

    isAvailable(): boolean {
        return this.stock.isAvailable();
    }

    hasAuthor(authorId: number): boolean {
        return this.authors.some((author) => author.id === authorId);
    }
}
