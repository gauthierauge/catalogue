import { ApiProperty } from '@nestjs/swagger';
import { BookType, BookGenre } from '@/books/domain/models/book.model';

export class AuthorResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    firstname: string;

    @ApiProperty()
    lastname: string;
}

export class BookListItemResponseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty({ enum: BookType })
    type: BookType;

    @ApiProperty({ enum: BookGenre })
    genre: BookGenre;

    @ApiProperty()
    price: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty({ type: [AuthorResponseDto] })
    authors: AuthorResponseDto[];
}

export class BookListResponseDto {
    @ApiProperty({ type: [BookListItemResponseDto] })
    data: BookListItemResponseDto[];
}
