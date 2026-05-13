import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { LoggerService } from '@/common/logger/logger.service';

@ApiTags('Books')
@Controller('books')
export class BooksController {
    constructor(
        private readonly getBooksListUseCase: GetBooksListUseCase,
        private readonly getBookDetailUseCase: GetBookDetailUseCase,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(BooksController.name);
    }

    @Get()
    @ApiOperation({ summary: 'Récupérer la liste des livres' })
    @ApiResponse({ status: 200, type: BookListResponseDto })
    @ApiResponse({ status: 400, description: 'Paramètres invalides' })
    async getBooks(
        @Query() query: GetBooksQueryDto,
    ): Promise<BookListResponseDto> {
        this.logger.log('Fetching books list', { filters: query });
        const books = await this.getBooksListUseCase.execute(query);
        this.logger.log('Successfully fetched books', { count: books.length });

        return {
            data: books.map((book) => this.toBookListItemDto(book)),
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Récupérer le détail d\'un livre' })
    @ApiResponse({ status: 200, type: BookDetailResponseDto })
    @ApiResponse({ status: 404, description: 'Livre non trouvé' })
    async getBookById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<BookDetailResponseDto> {
        this.logger.log('Fetching book detail', { bookId: id });
        const book = await this.getBookDetailUseCase.execute(id);
        this.logger.log('Successfully fetched book', { bookId: id, title: book.title });

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
