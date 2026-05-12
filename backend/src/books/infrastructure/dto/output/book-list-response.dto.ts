export interface AuthorResponseDto {
    id: number;
    firstname: string;
    lastname: string;
}

export interface BookListItemResponseDto {
    id: number;
    title: string;
    type: string;
    genre: string;
    price: number;
    quantity: number;
    authors: AuthorResponseDto[];
}

export interface BookListResponseDto {
    data: BookListItemResponseDto[];
}
