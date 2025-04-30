/*
  Warnings:

  - The `section` column on the `Faculty` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Faculty" DROP COLUMN "section",
ADD COLUMN     "section" TEXT[];
