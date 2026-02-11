-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" TEXT,
    "yellowBookEntryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_yellowBookEntryId_userId_key" ON "Review"("yellowBookEntryId", "userId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_yellowBookEntryId_fkey" FOREIGN KEY ("yellowBookEntryId") REFERENCES "YellowBookEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
