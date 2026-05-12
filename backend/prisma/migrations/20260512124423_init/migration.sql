-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('NOVEL', 'COMIC', 'MANGA', 'ESSAY', 'BIOGRAPHY', 'MANUAL');

-- CreateEnum
CREATE TYPE "BookGenre" AS ENUM ('SCIENCE_FICTION', 'FANTASY', 'CRIME', 'ROMANCE', 'HORROR', 'ADVENTURE', 'HISTORY', 'YOUNG_ADULT', 'CHILDREN', 'NON_FICTION');

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "lastname" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "publisherName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "type" "BookType" NOT NULL,
    "genre" "BookGenre" NOT NULL,
    "isbn" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockEvent" (
    "id" SERIAL NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "paymentId" TEXT,
    "bookId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "resultQuantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthorToBook" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AuthorToBook_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "StockEvent_idempotencyKey_key" ON "StockEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "_AuthorToBook_B_index" ON "_AuthorToBook"("B");

-- AddForeignKey
ALTER TABLE "StockEvent" ADD CONSTRAINT "StockEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToBook" ADD CONSTRAINT "_AuthorToBook_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToBook" ADD CONSTRAINT "_AuthorToBook_B_fkey" FOREIGN KEY ("B") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
