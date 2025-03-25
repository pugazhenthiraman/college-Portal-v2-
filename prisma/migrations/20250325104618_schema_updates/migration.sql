/*
  Warnings:

  - You are about to drop the column `countryCode` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Student` table. All the data in the column will be lost.
  - Added the required column `adhaarNo` to the `HOD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `HOD` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HOD" ADD COLUMN     "adhaarNo" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "countryCode",
DROP COLUMN "nationality",
ADD COLUMN     "adhaarNo" TEXT,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
