-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "videoStartSeconds" INTEGER;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "conflictSummary" TEXT,
ADD COLUMN     "entryPhrase" TEXT,
ADD COLUMN     "journalistsKilled" INTEGER,
ADD COLUMN     "journalistsKilledNote" TEXT,
ADD COLUMN     "statsSource" TEXT,
ADD COLUMN     "victimsLabel" TEXT,
ADD COLUMN     "victimsNumber" TEXT;

-- CreateTable
CREATE TABLE "Journalist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT,
    "photoUrl" TEXT,
    "bio" TEXT,
    "conflictsCovered" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Journalist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldPhoto" (
    "id" SERIAL NOT NULL,
    "journalistId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "credit" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FieldPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "journalistId" INTEGER,
    "locationId" INTEGER,
    "continent" TEXT,
    "videoUrl" TEXT,
    "videoStartSeconds" INTEGER,
    "audioUrl" TEXT,
    "sourceNote" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Journalist_slug_key" ON "Journalist"("slug");

-- CreateIndex
CREATE INDEX "FieldPhoto_journalistId_idx" ON "FieldPhoto"("journalistId");

-- CreateIndex
CREATE INDEX "FieldPhoto_locationId_idx" ON "FieldPhoto"("locationId");

-- CreateIndex
CREATE INDEX "Quote_locationId_idx" ON "Quote"("locationId");

-- CreateIndex
CREATE INDEX "Quote_journalistId_idx" ON "Quote"("journalistId");

-- AddForeignKey
ALTER TABLE "FieldPhoto" ADD CONSTRAINT "FieldPhoto_journalistId_fkey" FOREIGN KEY ("journalistId") REFERENCES "Journalist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldPhoto" ADD CONSTRAINT "FieldPhoto_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_journalistId_fkey" FOREIGN KEY ("journalistId") REFERENCES "Journalist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
