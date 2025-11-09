/*
  Warnings:

  - The values [VISION_MISSION] on the enum `OtherContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OtherContentType_new" AS ENUM ('HISTORY', 'FUNCTION', 'STRUCTURE');
ALTER TABLE "OtherContent" ALTER COLUMN "type" TYPE "OtherContentType_new" USING ("type"::text::"OtherContentType_new");
ALTER TYPE "OtherContentType" RENAME TO "OtherContentType_old";
ALTER TYPE "OtherContentType_new" RENAME TO "OtherContentType";
DROP TYPE "public"."OtherContentType_old";
COMMIT;
