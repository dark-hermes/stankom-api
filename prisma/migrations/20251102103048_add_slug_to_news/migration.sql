/*
  Warnings:

  - You are about to drop the column `description` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `detail` on the `History` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `History` table. All the data in the column will be lost.
  - You are about to drop the `Mission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vision` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `News` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `News` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "History" DROP COLUMN "description",
DROP COLUMN "detail",
DROP COLUMN "year",
ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "News" ADD COLUMN     "slug" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Mission";

-- DropTable
DROP TABLE "public"."Vision";

-- CreateTable
CREATE TABLE "VisionMission" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "VisionMission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");
