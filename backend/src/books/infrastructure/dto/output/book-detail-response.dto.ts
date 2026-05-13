import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookType, BookGenre } from '@/books/domain/models/book.model';
import { AuthorResponseDto } from './book-list-response.dto';

export class BookDetailResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    isbn: string;

    @ApiProperty({ enum: BookType })
    type: BookType;

    @ApiProperty({ enum: BookGenre })
    genre: BookGenre;

    @ApiProperty()
    price: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    available: boolean;

    @ApiProperty({ type: [AuthorResponseDto] })
    authors: AuthorResponseDto[];

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiPropertyOptional()
    publisherName?: string;

    @ApiPropertyOptional()
    publicationDate?: string;
}
