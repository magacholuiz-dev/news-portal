-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "isAnchorEpisode" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "accessCategory" TEXT,
ADD COLUMN     "continent" TEXT,
ADD COLUMN     "continentOrder" INTEGER,
ADD COLUMN     "coveragePct" DOUBLE PRECISION,
ADD COLUMN     "displayOrder" INTEGER,
ADD COLUMN     "journalistNote" TEXT,
ADD COLUMN     "mediaAttentionClass" TEXT,
ADD COLUMN     "riskLevelRSF" TEXT;
