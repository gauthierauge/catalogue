import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { BookType, BookGenre } from '@/books/domain/models/book.model';

export class GetBooksQueryDto {
    // Filtres
    @IsOptional()
    @IsEnum(BookType)
    type?: BookType;

    @IsOptional()
    @IsEnum(BookGenre)
    genre?: BookGenre;

    @IsOptional()
    @IsString()
    search?: string; // Recherche dans titre ou auteur

    // Pagination
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    // Tri
    @IsOptional()
    @IsEnum(['title', 'price', 'publicationDate', 'createdAt'])
    sortBy?: 'title' | 'price' | 'publicationDate' | 'createdAt' = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';
    //
    // @IsOptional()
    // @IsEnum(BookGenre)
    // genre?: BookGenre;
    //
    // @IsOptional()
    // @IsInt()
    // @Min(1)
    // page?: number = 1;
    //
    // @IsOptional()
    // @IsInt()
    // @Min(1)
    // @Max(100)
    // limit?: number = 20;
}
