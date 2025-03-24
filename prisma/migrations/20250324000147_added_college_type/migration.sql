/*
  Warnings:

  - Added the required column `collegeType` to the `College` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CollegeType" AS ENUM ('ENGINEERING', 'ARTS');

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "collegeType" "CollegeType" NOT NULL;
