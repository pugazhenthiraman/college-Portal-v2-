/*
  Warnings:

  - Added the required column `departmentType` to the `College` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "College" ADD COLUMN     "departmentType" TEXT NOT NULL;
