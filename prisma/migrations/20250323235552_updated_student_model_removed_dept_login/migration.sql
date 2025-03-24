/*
  Warnings:

  - The values [DEPARTMENT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `userId` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `personalEmail` on the `Student` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondaryPhoneNo` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'COLLEGE', 'HOD', 'FACULTY', 'STUDENT');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_userId_fkey";

-- DropIndex
DROP INDEX "Department_userId_key";

-- DropIndex
DROP INDEX "Student_personalEmail_key";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "name",
DROP COLUMN "personalEmail",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT NOT NULL,
ADD COLUMN     "personalEmailId" TEXT,
ADD COLUMN     "secondaryPhoneNo" TEXT NOT NULL;
