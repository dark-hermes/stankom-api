/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `SocialMedia` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `SocialMedia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SocialMedia" DROP COLUMN "name",
ADD COLUMN     "name" "SocialMediaType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SocialMedia_name_key" ON "SocialMedia"("name");
