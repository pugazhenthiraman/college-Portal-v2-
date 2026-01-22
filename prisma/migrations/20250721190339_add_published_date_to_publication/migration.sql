-- AlterTable
ALTER TABLE "EnhancementProgram" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "publishedDate" TIMESTAMP(3);
