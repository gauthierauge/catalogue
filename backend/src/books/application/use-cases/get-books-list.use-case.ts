import { Inject, Injectable, Logger } from '@nestjs/common';
import {
    BOOK_REPOSITORY,
    BookRepositoryPort,
    BookQueryFilters,
} from '@/books/application/ports/book-repository.port';
import { Book } from '@/books/domain/models/book.model';

@Injectable()
export class GetBooksListUseCase {
    private readonly logger = new Logger(GetBooksListUseCase.name);

    constructor(
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: BookRepositoryPort,
    ) { }

    async execute(filters?: BookQueryFilters): Promise<Book[]> {
        this.logger.debug('Executing GetBooksListUseCase', filters);
        const books = await this.bookRepository.findAll(filters);
        this.logger.debug(`Retrieved ${books.length} books from repository`);
        return books;
    }
}
