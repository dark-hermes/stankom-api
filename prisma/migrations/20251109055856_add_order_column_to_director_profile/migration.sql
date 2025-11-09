/*
  Warnings:

  - Added the required column `order` to the `DirectorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectorProfile" ADD COLUMN     "order" INTEGER NOT NULL;
