-- CreateTable
CREATE TABLE "JournalistPlace" (
    "journalistId" INTEGER NOT NULL,
    "locationId" INTEGER NOT NULL,
    "label" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JournalistPlace_pkey" PRIMARY KEY ("journalistId","locationId")
);

-- CreateIndex
CREATE INDEX "JournalistPlace_locationId_idx" ON "JournalistPlace"("locationId");

-- AddForeignKey
ALTER TABLE "JournalistPlace" ADD CONSTRAINT "JournalistPlace_journalistId_fkey" FOREIGN KEY ("journalistId") REFERENCES "Journalist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalistPlace" ADD CONSTRAINT "JournalistPlace_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
