-- CreateEnum
CREATE TYPE "TechnicalSkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateTable
CREATE TABLE "UGDetails" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "semesterNo" TEXT,
    "semesterMarksheet" TEXT,
    "overallCGPA" TEXT,
    "overallPercentage" TEXT,
    "isPG" BOOLEAN DEFAULT false,
    "pgSemesterNo" TEXT,
    "pgSemesterMarksheet" TEXT,
    "pgOverallCGPA" TEXT,
    "pgOverallPercentage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UGDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicalSkill" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "details" TEXT NOT NULL,
    "level" "TechnicalSkillLevel" NOT NULL,
    "certificateFile" TEXT,
    "certificateName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnicalSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "certificate" TEXT,
    "certificateName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnhancementProgram" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "contribution" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnhancementProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialProfile" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "github" TEXT,
    "gitlab" TEXT,
    "bitbucket" TEXT,
    "linkedin" TEXT,
    "twitter" TEXT,
    "portfolio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "employer" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "onCampus" BOOLEAN NOT NULL,
    "ctc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkExperience" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "employer" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "ctc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TechnicalSkill_level_idx" ON "TechnicalSkill"("level");

-- CreateIndex
CREATE UNIQUE INDEX "SocialProfile_studentId_key" ON "SocialProfile"("studentId");

-- CreateIndex
CREATE INDEX "Publication_publisher_idx" ON "Publication"("publisher");

-- CreateIndex
CREATE INDEX "Student_academicYear_section_idx" ON "Student"("academicYear", "section");

-- AddForeignKey
ALTER TABLE "UGDetails" ADD CONSTRAINT "UGDetails_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicalSkill" ADD CONSTRAINT "TechnicalSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnhancementProgram" ADD CONSTRAINT "EnhancementProgram_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialProfile" ADD CONSTRAINT "SocialProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkExperience" ADD CONSTRAINT "WorkExperience_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
