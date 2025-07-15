/*
  Warnings:

  - Added the required column `companyEmail` to the `Internship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "companyEmail" TEXT NOT NULL,
ADD COLUMN     "stipend" TEXT,
ADD COLUMN     "supervisorName" TEXT;
