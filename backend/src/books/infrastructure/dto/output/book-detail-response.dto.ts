import { AuthorResponseDto } from './book-list-response.dto';

export interface BookDetailResponseDto {
    id: number;
    title: string;
    isbn: string;
    type: string;
    genre: string;
    price: number;
    quantity: number;
    available: boolean;
    authors: AuthorResponseDto[];
    createdAt: string;
    updatedAt: string;
    description?: string;
    publisherName?: string;
    publicationDate?: string;
}
