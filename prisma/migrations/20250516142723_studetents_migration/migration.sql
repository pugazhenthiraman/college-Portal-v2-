/*
  Warnings:

  - You are about to drop the column `createdAt` on the `UGDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UGDetails" DROP COLUMN "createdAt",
ALTER COLUMN "isPG" DROP DEFAULT;
