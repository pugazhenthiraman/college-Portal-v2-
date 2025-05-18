/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `UGDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UGDetails_studentId_key" ON "UGDetails"("studentId");
