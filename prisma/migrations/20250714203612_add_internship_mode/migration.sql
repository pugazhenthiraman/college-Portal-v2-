/*
  Warnings:

  - You are about to drop the column `batch` on the `Student` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InternshipType" AS ENUM ('ONSITE', 'WORK_FROM_HOME');

-- AlterTable
ALTER TABLE "Internship" ADD COLUMN     "mode" "InternshipType";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "batch";
