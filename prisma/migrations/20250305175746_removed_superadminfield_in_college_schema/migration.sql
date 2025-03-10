/*
  Warnings:

  - You are about to drop the column `superAdminId` on the `College` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "College" DROP CONSTRAINT "College_superAdminId_fkey";

-- AlterTable
ALTER TABLE "College" DROP COLUMN "superAdminId";
