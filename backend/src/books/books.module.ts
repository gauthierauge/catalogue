import { Module } from '@nestjs/common';
import { BooksController } from './infrastructure/controllers/books.controller';
import { GetBooksListUseCase } from './application/use-cases/get-books-list.use-case';
import { GetBookDetailUseCase } from './application/use-cases/get-book-detail.use-case';
import { BOOK_REPOSITORY } from './application/ports/book-repository.port';
import { PrismaBookRepository } from './infrastructure/adapters/prisma-book.repository';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [BooksController],
    providers: [
        GetBooksListUseCase,
        GetBookDetailUseCase,
        {
            provide: BOOK_REPOSITORY,
            useClass: PrismaBookRepository,
        },
    ],
    exports: [],
})
export class BooksModule { }
