/*
  Warnings:

  - You are about to drop the column `createdAt` on the `TechnicalSkill` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TechnicalSkill_level_idx";

-- AlterTable
ALTER TABLE "TechnicalSkill" DROP COLUMN "createdAt",
ALTER COLUMN "courseName" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "details" DROP NOT NULL,
ALTER COLUMN "level" DROP NOT NULL;
