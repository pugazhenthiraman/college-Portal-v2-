/*
  Warnings:

  - You are about to drop the column `rollno` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rollNo]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rollNo` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_facultyId_fkey";

-- DropIndex
DROP INDEX "Student_rollno_key";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "rollno",
ADD COLUMN     "rollNo" TEXT NOT NULL,
ALTER COLUMN "facultyId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_rollNo_key" ON "Student"("rollNo");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
