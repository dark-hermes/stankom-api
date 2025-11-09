/*
  Warnings:

  - You are about to drop the column `period` on the `DirectorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `pict` on the `DirectorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `Statistic` table. All the data in the column will be lost.
  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OtherContent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `beginYear` to the `DirectorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `picture` to the `DirectorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DirectorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Faq` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Faq` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `HeroSection` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SocialMedia` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Statistic` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StatisticCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectorProfile" DROP COLUMN "period",
DROP COLUMN "pict",
ADD COLUMN     "beginYear" INTEGER NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endYear" INTEGER,
ADD COLUMN     "picture" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Faq" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "HeroSection" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "SocialMedia" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Statistic" DROP COLUMN "icon",
DROP COLUMN "symbol",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StatisticCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Link";

-- DropTable
DROP TABLE "public"."OtherContent";

-- DropEnum
DROP TYPE "public"."OtherContentType";

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolesResponsibilities" (
    "id" SERIAL NOT NULL,
    "roles" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolesResponsibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Structure" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Structure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialMediaPost" (
    "id" SERIAL NOT NULL,
    "platform" "SocialMediaType" NOT NULL,
    "postLink" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,
    "updatedById" INTEGER,

    CONSTRAINT "SocialMediaPost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faq" ADD CONSTRAINT "Faq_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMediaPost" ADD CONSTRAINT "SocialMediaPost_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
