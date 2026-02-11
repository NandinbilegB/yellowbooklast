-- CreateEnum
CREATE TYPE "OrganizationKind" AS ENUM ('BUSINESS', 'GOVERNMENT', 'MUNICIPAL', 'NGO', 'SERVICE');

-- CreateTable
CREATE TABLE "YellowBookCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YellowBookCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YellowBookTag" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YellowBookTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YellowBookEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "streetAddress" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "secondaryPhone" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "googleMapUrl" TEXT,
    "hours" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "kind" "OrganizationKind" NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YellowBookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YellowBookEntryTag" (
    "entryId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "YellowBookEntryTag_pkey" PRIMARY KEY ("entryId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "YellowBookCategory_slug_key" ON "YellowBookCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "YellowBookTag_label_key" ON "YellowBookTag"("label");

-- AddForeignKey
ALTER TABLE "YellowBookEntry" ADD CONSTRAINT "YellowBookEntry_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "YellowBookCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YellowBookEntryTag" ADD CONSTRAINT "YellowBookEntryTag_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "YellowBookEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YellowBookEntryTag" ADD CONSTRAINT "YellowBookEntryTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "YellowBookTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
