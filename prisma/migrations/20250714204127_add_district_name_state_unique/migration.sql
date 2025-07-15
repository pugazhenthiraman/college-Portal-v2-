/*
  Warnings:

  - A unique constraint covering the columns `[name,state]` on the table `District` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "District_name_state_key" ON "District"("name", "state");
