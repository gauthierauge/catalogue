import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
    BOOK_REPOSITORY,
    BookRepositoryPort,
} from '@/books/application/ports/book-repository.port';
import { Book } from '@/books/domain/models/book.model';

@Injectable()
export class GetBookDetailUseCase {
    private readonly logger = new Logger(GetBookDetailUseCase.name);

    constructor(
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: BookRepositoryPort,
    ) { }

    async execute(id: number): Promise<Book> {
        this.logger.debug(`Executing GetBookDetailUseCase for book ID: ${id}`);

        const book = await this.bookRepository.findById(id);

        if (!book) {
            this.logger.warn(`Book with ID ${id} not found`);
            throw new NotFoundException(`Book with ID ${id} not found`);
        }

        this.logger.debug(`Retrieved book: ${book.title}`);
        return book;
    }
}
