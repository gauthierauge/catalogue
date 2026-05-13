import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    BOOK_REPOSITORY,
    BookRepositoryPort,
} from '@/books/application/ports/book-repository.port';
import { Book } from '@/books/domain/models/book.model';
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class GetBookDetailUseCase {
    constructor(
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: BookRepositoryPort,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(GetBookDetailUseCase.name);
    }

    async execute(id: number): Promise<Book> {
        this.logger.debug('Executing GetBookDetailUseCase', { bookId: id });

        const book = await this.bookRepository.findById(id);

        if (!book) {
            this.logger.warn('Book not found', { bookId: id });
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        this.logger.debug('Retrieved book', { bookId: id, title: book.title });
        return book;
    }
}
