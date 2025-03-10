/*
  Warnings:

  - The primary key for the `College` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `affiliated_university` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `council_issuing_code` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `deemed_university` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `institute_code` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `recognition_status` on the `College` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `College` table. All the data in the column will be lost.
  - The `id` column on the `College` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Department` table. All the data in the column will be lost.
  - The `id` column on the `Department` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Faculty` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Faculty` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Faculty` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Faculty` table. All the data in the column will be lost.
  - The `id` column on the `Faculty` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hodId` column on the `Faculty` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `HOD` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `HOD` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `HOD` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `HOD` table. All the data in the column will be lost.
  - The `id` column on the `HOD` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Student` table. All the data in the column will be lost.
  - The `id` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `hodId` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SuperAdmin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `SuperAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `SuperAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `SuperAdmin` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `SuperAdmin` table. All the data in the column will be lost.
  - The `id` column on the `SuperAdmin` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `College` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[secondaryEmailId]` on the table `College` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Faculty` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `HOD` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `SuperAdmin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `affiliatedUniversity` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `councilIssuingCode` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deemedUniversity` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recognitionStatus` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `College` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `collegeId` on the `Department` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `Faculty` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `collegeId` on the `Faculty` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `departmentId` on the `Faculty` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `HOD` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `collegeId` on the `HOD` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `departmentId` on the `HOD` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `collegeId` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `departmentId` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `facultyId` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `userId` to the `SuperAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_hodId_fkey";

-- DropForeignKey
ALTER TABLE "HOD" DROP CONSTRAINT "HOD_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "HOD" DROP CONSTRAINT "HOD_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_collegeId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_hodId_fkey";

-- DropIndex
DROP INDEX "College_email_key";

-- DropIndex
DROP INDEX "Department_email_key";

-- DropIndex
DROP INDEX "Faculty_email_key";

-- DropIndex
DROP INDEX "HOD_email_key";

-- DropIndex
DROP INDEX "Student_email_key";

-- DropIndex
DROP INDEX "SuperAdmin_email_key";

-- AlterTable
ALTER TABLE "College" DROP CONSTRAINT "College_pkey",
DROP COLUMN "affiliated_university",
DROP COLUMN "council_issuing_code",
DROP COLUMN "deemed_university",
DROP COLUMN "email",
DROP COLUMN "institute_code",
DROP COLUMN "password",
DROP COLUMN "recognition_status",
DROP COLUMN "role",
ADD COLUMN     "affiliatedUniversity" TEXT NOT NULL,
ADD COLUMN     "councilIssuingCode" TEXT NOT NULL,
ADD COLUMN     "deemedUniversity" TEXT NOT NULL,
ADD COLUMN     "instituteCode" TEXT,
ADD COLUMN     "recognitionStatus" TEXT NOT NULL,
ADD COLUMN     "secondaryEmailId" TEXT,
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "College_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Department" DROP CONSTRAINT "Department_pkey",
DROP COLUMN "email",
DROP COLUMN "role",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "collegeId",
ADD COLUMN     "collegeId" INTEGER NOT NULL,
ADD CONSTRAINT "Department_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_pkey",
DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "collegeId",
ADD COLUMN     "collegeId" INTEGER NOT NULL,
DROP COLUMN "departmentId",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
DROP COLUMN "hodId",
ADD COLUMN     "hodId" INTEGER,
ADD CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "HOD" DROP CONSTRAINT "HOD_pkey",
DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "collegeId",
ADD COLUMN     "collegeId" INTEGER NOT NULL,
DROP COLUMN "departmentId",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
ADD CONSTRAINT "HOD_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "collegeId",
ADD COLUMN     "collegeId" INTEGER NOT NULL,
DROP COLUMN "departmentId",
ADD COLUMN     "departmentId" INTEGER NOT NULL,
DROP COLUMN "facultyId",
ADD COLUMN     "facultyId" INTEGER NOT NULL,
DROP COLUMN "hodId",
ADD COLUMN     "hodId" INTEGER,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SuperAdmin" DROP CONSTRAINT "SuperAdmin_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "College_userId_key" ON "College"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "College_secondaryEmailId_key" ON "College"("secondaryEmailId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_userId_key" ON "Department"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_userId_key" ON "Faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HOD_userId_key" ON "HOD"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HOD_departmentId_key" ON "HOD"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_userId_key" ON "SuperAdmin"("userId");

-- AddForeignKey
ALTER TABLE "SuperAdmin" ADD CONSTRAINT "SuperAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "College" ADD CONSTRAINT "College_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOD" ADD CONSTRAINT "HOD_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOD" ADD CONSTRAINT "HOD_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HOD" ADD CONSTRAINT "HOD_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faculty" ADD CONSTRAINT "Faculty_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "HOD"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "HOD"("id") ON DELETE SET NULL ON UPDATE CASCADE;
