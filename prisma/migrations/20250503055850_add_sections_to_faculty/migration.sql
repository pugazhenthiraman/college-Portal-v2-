/*
  Warnings:

  - You are about to drop the column `section` on the `Faculty` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Faculty" DROP COLUMN "section",
ADD COLUMN     "sections" TEXT[] DEFAULT ARRAY[]::TEXT[];
