/*
  Warnings:

  - You are about to drop the column `designation` on the `Placement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Placement" DROP COLUMN "designation",
ADD COLUMN     "block" TEXT,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "state" TEXT;
