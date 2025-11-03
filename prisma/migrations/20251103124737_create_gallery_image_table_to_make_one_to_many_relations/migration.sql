/*
  Warnings:

  - You are about to drop the column `pict` on the `Gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Gallery" DROP COLUMN "pict";

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" SERIAL NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
