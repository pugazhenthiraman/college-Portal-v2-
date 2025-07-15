/*
  Warnings:

  - A unique constraint covering the columns `[name,districtId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Block_name_districtId_key" ON "Block"("name", "districtId");
