import { Book, BookType, BookGenre } from '@/books/domain/models/book.model';

export interface BookQueryFilters {
    type?: BookType;
    genre?: BookGenre;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'price' | 'publicationDate' | 'createdAt';
    order?: 'asc' | 'desc';
}

export abstract class BookRepositoryPort {
    abstract findAll(filters?: BookQueryFilters): Promise<Book[]>;
    abstract findById(id: number): Promise<Book | null>;
}

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');
