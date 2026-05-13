import { Injectable } from '@nestjs/common';
import {
    BookRepositoryPort,
    BookQueryFilters,
} from '@/books/application/ports/book-repository.port';
import { Book, BookGenre, BookType } from '@/books/domain/models/book.model';
import { Author } from '@/books/domain/models/author.model';
import { Price } from '@/books/domain/value-objects/price.vo';
import { Stock } from '@/books/domain/value-objects/stock.vo';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PrismaBookRepository implements BookRepositoryPort {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters?: BookQueryFilters): Promise<Book[]> {
        const where: any = {};

        if (filters?.type) {
            where.type = filters.type;
        }

        if (filters?.genre) {
            where.genre = filters.genre;
        }

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                {
                    authors: {
                        some: {
                            OR: [
                                { firstname: { contains: filters.search, mode: 'insensitive' } },
                                { lastname: { contains: filters.search, mode: 'insensitive' } },
                            ],
                        },
                    },
                },
            ];
        }

        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const skip = (page - 1) * limit;

        const sortBy = filters?.sortBy || 'createdAt';
        const order = filters?.order || 'desc';

        const booksFromDb = await this.prisma.book.findMany({
            where,
            include: {
                authors: true,
            },
            orderBy: {
                [sortBy]: order,
            },
            skip,
            take: limit,
        });

        return booksFromDb.map((bookData) => this.toDomain(bookData));
    }

    async findById(id: number): Promise<Book | null> {
        const bookData = await this.prisma.book.findUnique({
            where: { id },
            include: {
                authors: true,
            },
        });

        if (!bookData) {
            return null;
        }

        return this.toDomain(bookData);
    }

    private toDomain(bookData: any): Book {
        const authors = bookData.authors.map(
            (author: any) => new Author(author.id, author.firstname, author.lastname),
        );

        return new Book(
            bookData.id,
            bookData.title,
            bookData.isbn,
            bookData.type as BookType,
            bookData.genre as BookGenre,
            Price.create(bookData.price),
            Stock.create(bookData.quantity),
            authors,
            bookData.createdAt,
            bookData.updatedAt,
            bookData.description,
            bookData.publisherName,
            bookData.publicationDate,
        );
    }
}
