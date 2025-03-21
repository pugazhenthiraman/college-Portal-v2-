/*
  Warnings:

  - You are about to drop the column `userId` on the `Department` table. All the data in the column will be lost.
  - Added the required column `collegeType` to the `College` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CollegeType" AS ENUM ('ENGINEERING', 'ARTS');

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_userId_fkey";

-- DropIndex
DROP INDEX "Department_userId_key";

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "collegeType" "CollegeType" NOT NULL;

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "userId";
