/*
  Warnings:

  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Structure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VisionMission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `link` to the `Statistic` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtherContentType" AS ENUM ('HISTORY', 'VISION_MISSION', 'STRUCTURE');

-- AlterTable
ALTER TABLE "Statistic" ADD COLUMN     "link" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."History";

-- DropTable
DROP TABLE "public"."Structure";

-- DropTable
DROP TABLE "public"."VisionMission";

-- CreateTable
CREATE TABLE "OtherContent" (
    "id" SERIAL NOT NULL,
    "type" "OtherContentType" NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "OtherContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtherContent_type_key" ON "OtherContent"("type");
