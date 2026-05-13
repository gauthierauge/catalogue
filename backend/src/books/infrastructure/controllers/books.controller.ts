import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBooksListUseCase } from '@/books/application/use-cases/get-books-list.use-case';
import { GetBooksQueryDto } from '@/books/infrastructure/dto/input/get-books-query.dto';
import {
    BookListResponseDto,
    BookListItemResponseDto,
    AuthorResponseDto,
} from '@/books/infrastructure/dto/output/book-list-response.dto';
import { Book } from '@/books/domain/models/book.model';

@ApiTags('Books')
@Controller('books')
export class BooksController {
    private readonly logger = new Logger(BooksController.name);

    constructor(private readonly getBooksListUseCase: GetBooksListUseCase) { }

    @Get()
    @ApiOperation({ summary: 'Récupérer la liste des livres' })
    @ApiResponse({ status: 200, type: BookListResponseDto })
    @ApiResponse({ status: 400, description: 'Paramètres invalides' })
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
}
