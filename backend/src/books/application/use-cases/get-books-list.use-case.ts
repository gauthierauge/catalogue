import { Inject, Injectable } from '@nestjs/common';
import {
    BOOK_REPOSITORY,
    BookRepositoryPort,
    BookQueryFilters,
} from '@/books/application/ports/book-repository.port';
import { Book } from '@/books/domain/models/book.model';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class GetBooksListUseCase {
    constructor(
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: BookRepositoryPort,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(GetBooksListUseCase.name);
    }

    async execute(filters?: BookQueryFilters): Promise<Book[]> {
        this.logger.debug('Executing GetBooksListUseCase', { filters });
        const books = await this.bookRepository.findAll(filters);
        this.logger.debug('Retrieved books from repository', { count: books.length });
        return books;
    }
}
