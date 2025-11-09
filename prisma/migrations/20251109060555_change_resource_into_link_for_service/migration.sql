/*
  Warnings:

  - You are about to drop the column `resource` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "resource",
ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "Statistic" ALTER COLUMN "link" DROP NOT NULL;
