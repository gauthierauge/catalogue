import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookType, BookGenre } from '@/books/domain/models/book.model';

export class GetBooksQueryDto {
    @ApiPropertyOptional({ enum: BookType, description: 'Filtrer par type de livre' })
    @IsOptional()
    @IsEnum(BookType)
    type?: BookType;

    @ApiPropertyOptional({ enum: BookGenre, description: 'Filtrer par genre' })
    @IsOptional()
    @IsEnum(BookGenre)
    genre?: BookGenre;

    @ApiPropertyOptional({ description: 'Recherche sur titre ou auteur' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ minimum: 1, default: 1, description: 'Numéro de page' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 10, description: 'Nombre de résultats par page' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({ enum: ['title', 'price', 'publicationDate', 'createdAt'], default: 'createdAt', description: 'Champ de tri' })
    @IsOptional()
    @IsEnum(['title', 'price', 'publicationDate', 'createdAt'])
    sortBy?: 'title' | 'price' | 'publicationDate' | 'createdAt' = 'createdAt';

    @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc', description: 'Ordre de tri' })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    order?: 'asc' | 'desc' = 'desc';
}
