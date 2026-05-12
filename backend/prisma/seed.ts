import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { BookGenre, BookType, PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

type SeedAuthor = {
  firstname: string;
  lastname: string;
};

type SeedBook = {
  title: string;
  price: number;
  description: string;
  publisherName: string;
  quantity: number;
  type: BookType;
  genre: BookGenre;
  isbn: string;
  publicationDate: Date;
  authors: SeedAuthor[];
};

const books: SeedBook[] = [
  {
    title: 'Dune',
    price: 12.9,
    description: 'A science fiction classic set on the desert planet Arrakis.',
    publisherName: 'Ace Books',
    quantity: 15,
    type: BookType.NOVEL,
    genre: BookGenre.SCIENCE_FICTION,
    isbn: '9780441172719',
    publicationDate: new Date('1965-08-01'),
    authors: [{ firstname: 'Frank', lastname: 'Herbert' }],
  },
  {
    title: 'Batman: Year One',
    price: 16.5,
    description: 'The origin of Batman and Jim Gordon in Gotham City.',
    publisherName: 'DC Comics',
    quantity: 8,
    type: BookType.COMIC,
    genre: BookGenre.CRIME,
    isbn: '9781401207526',
    publicationDate: new Date('1987-02-01'),
    authors: [
      { firstname: 'Frank', lastname: 'Miller' },
      { firstname: 'David', lastname: 'Mazzucchelli' },
    ],
  },
  {
    title: 'One Piece Vol. 1',
    price: 7.2,
    description: 'Monkey D. Luffy starts his journey to become the Pirate King.',
    publisherName: 'Shueisha',
    quantity: 25,
    type: BookType.MANGA,
    genre: BookGenre.ADVENTURE,
    isbn: '9781569319017',
    publicationDate: new Date('1997-12-24'),
    authors: [{ firstname: 'Eiichiro', lastname: 'Oda' }],
  },
  {
    title: 'Clean Code',
    price: 34.9,
    description: 'A practical guide to writing readable and maintainable code.',
    publisherName: 'Prentice Hall',
    quantity: 10,
    type: BookType.MANUAL,
    genre: BookGenre.NON_FICTION,
    isbn: '9780132350884',
    publicationDate: new Date('2008-08-01'),
    authors: [{ firstname: 'Robert C.', lastname: 'Martin' }],
  },
];

async function findOrCreateAuthor(author: SeedAuthor): Promise<{ id: number }> {
  const existingAuthor = await prisma.author.findFirst({
    where: {
      firstname: author.firstname,
      lastname: author.lastname,
    },
    select: { id: true },
  });

  if (existingAuthor) {
    return existingAuthor;
  }

  return prisma.author.create({
    data: author,
    select: { id: true },
  });
}

async function main(): Promise<void> {
  for (const book of books) {
    const authors = await Promise.all(book.authors.map(findOrCreateAuthor));
    const authorConnections = authors.map((author) => ({ id: author.id }));

    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        price: book.price,
        description: book.description,
        publisherName: book.publisherName,
        quantity: book.quantity,
        type: book.type,
        genre: book.genre,
        publicationDate: book.publicationDate,
        authors: {
          set: authorConnections,
        },
      },
      create: {
        title: book.title,
        price: book.price,
        description: book.description,
        publisherName: book.publisherName,
        quantity: book.quantity,
        type: book.type,
        genre: book.genre,
        isbn: book.isbn,
        publicationDate: book.publicationDate,
        authors: {
          connect: authorConnections,
        },
      },
    });
  }

  console.log(`Seeded ${books.length} books`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
