/*
  Warnings:

  - A unique constraint covering the columns `[rollno]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[personalEmail]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `DOB` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personalEmail` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNo` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rollno` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_departmentId_fkey";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "DOB" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "departmentName" TEXT NOT NULL,
ADD COLUMN     "nationality" TEXT NOT NULL,
ADD COLUMN     "passportExpiryDate" TIMESTAMP(3),
ADD COLUMN     "passportNo" TEXT,
ADD COLUMN     "personalEmail" TEXT NOT NULL,
ADD COLUMN     "phoneNo" TEXT NOT NULL,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "rollno" TEXT NOT NULL,
ALTER COLUMN "departmentId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollno_key" ON "Student"("rollno");

-- CreateIndex
CREATE UNIQUE INDEX "Student_personalEmail_key" ON "Student"("personalEmail");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
