import { Controller, Get, Query, Logger, Param, ParseIntPipe } from '@nestjs/common';
import { GetBooksListUseCase } from '@/books/application/use-cases/get-books-list.use-case';
import { GetBookDetailUseCase } from '@/books/application/use-cases/get-book-detail.use-case';
import { GetBooksQueryDto } from '@/books/infrastructure/dto/input/get-books-query.dto';
import {
    BookListResponseDto,
    BookListItemResponseDto,
    AuthorResponseDto,
} from '@/books/infrastructure/dto/output/book-list-response.dto';
import { BookDetailResponseDto } from '@/books/infrastructure/dto/output/book-detail-response.dto';
import { Book } from '@/books/domain/models/book.model';

@Controller('books')
export class BooksController {
    private readonly logger = new Logger(BooksController.name);

    constructor(
        private readonly getBooksListUseCase: GetBooksListUseCase,
        private readonly getBookDetailUseCase: GetBookDetailUseCase,
    ) { }

    @Get()
    async getBooks(
        @Query() query: GetBooksQueryDto,
    ): Promise<BookListResponseDto> {
        this.logger.log('Fetching books list', query);
        const books = await this.getBooksListUseCase.execute(query);
        this.logger.log(`Successfully fetched ${books.length} books`);

        return {
            data: books.map((book) => this.toBookListItemDto(book)),
        };
    }

    @Get(':id')
    async getBookById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<BookDetailResponseDto> {
        this.logger.log(`Fetching book detail for ID: ${id}`);
        const book = await this.getBookDetailUseCase.execute(id);
        this.logger.log(`Successfully fetched book: ${book.title}`);

        return this.toBookDetailDto(book);
    }

    private toBookListItemDto(book: Book): BookListItemResponseDto {
        return {
            id: book.id,
            title: book.title,
            type: book.type,
            genre: book.genre,
            price: book.price.value,
            quantity: book.stock.quantity,
            authors: book.authors.map((author) => this.toAuthorDto(author)),
        };
    }

    private toAuthorDto(author: any): AuthorResponseDto {
        return {
            id: author.id,
            firstname: author.firstname,
            lastname: author.lastname,
        };
    }

    private toBookDetailDto(book: Book): BookDetailResponseDto {
        return {
            id: book.id,
            title: book.title,
            isbn: book.isbn,
            type: book.type,
            genre: book.genre,
            price: book.price.value,
            quantity: book.stock.quantity,
            available: book.isAvailable(),
            authors: book.authors.map((author) => this.toAuthorDto(author)),
            createdAt: book.createdAt.toISOString(),
            updatedAt: book.updatedAt.toISOString(),
            description: book.description,
            publisherName: book.publisherName,
            publicationDate: book.publicationDate?.toISOString(),
        };
    }
}
