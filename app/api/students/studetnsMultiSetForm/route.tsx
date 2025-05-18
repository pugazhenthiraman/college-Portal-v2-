import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// List of allowed form sections for validation
const ALLOWED_SECTIONS = [
  "general",
  "ugDetails",
  "technicalSkills",
  "internships",
  "events",
  "socialProfiles",
  "placements",
  "workExperience",
  "publications",
] as const;
type Section = typeof ALLOWED_SECTIONS[number];

/**
 * POST handler for saving/updating student multi-section form data.
 * Expects: { section: string, data: any }
 */
export async function POST(req: NextRequest) {
  console.log("API: POST /api/students/studetnsMultiSetForm called");
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You are not authorized. Please log in again." },
      { status: 401 }
    );
  }

  // 2. Parse request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request format. Please refresh and try again." },
      { status: 400 }
    );
  }
  const { section, data } = body as { section?: string; data?: any };

  // 3. Validate section
  if (typeof section !== "string" || !ALLOWED_SECTIONS.includes(section as Section)) {
    return NextResponse.json(
      { error: `Internal error: Section "${String(section)}" is not supported. Please contact support.` },
      { status: 400 }
    );
  }

  // 4. Find student record
  const userId = Number(session.user.id);
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) {
    return NextResponse.json(
      { error: "Student record not found. Please contact support." },
      { status: 404 }
    );
  }
  const studentId = student.id;

  try {
    let updatedStudent;
    // 5. Handle each section
    switch (section) {
      case "general":
        updatedStudent = await prisma.student.update({
          where: { userId },
          data: {
            firstName: data.candidate_first_name,
            lastName: data.candidate_last_name,
            photo: data.photo,
            batch: data.batch,
            rollNo: data.roll_reg_no,
            sslcPercentage: data.sslc_percentage,
            hscPercentage: data.hsc_percentage,
            personalEmailId: data.email,
          },
        });
        break;

      case "ugDetails":
        await prisma.uGDetails.upsert({
          where: { studentId },
          update: {
            semesterNo: data.semesterNo,
            semesterMarksheet: data.semesterMarksheet,
            overallCGPA: data.overallCGPA,
            overallPercentage: data.overallPercentage,
            isPG: data.isPG,
            pgSemesterNo: data.pgSemesterNo,
            pgSemesterMarksheet: data.pgSemesterMarksheet,
            pgOverallCGPA: data.pgOverallCGPA,
            pgOverallPercentage: data.pgOverallPercentage,
          },
          create: {
            studentId,
            semesterNo: data.semesterNo,
            semesterMarksheet: data.semesterMarksheet,
            overallCGPA: data.overallCGPA,
            overallPercentage: data.overallPercentage,
            isPG: data.isPG,
            pgSemesterNo: data.pgSemesterNo,
            pgSemesterMarksheet: data.pgSemesterMarksheet,
            pgOverallCGPA: data.pgOverallCGPA,
            pgOverallPercentage: data.pgOverallPercentage,
          },
        });
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

        // ...existing code...
case "technicalSkills":
  await prisma.technicalSkill.deleteMany({ where: { studentId } });
  if (Array.isArray(data) && data.length > 0) {
    await prisma.technicalSkill.createMany({
      data: data.map((skill: any) => {
        const mapped: any = { studentId };
        if (skill.courseName) mapped.courseName = skill.courseName;
        if (skill.details) mapped.details = skill.details;
        if (skill.level) mapped.level = skill.level.replace(/\s+/g, "_").toUpperCase(); // <-- FIXED
        if (skill.certificateFile) mapped.certificateFile = skill.certificateFile;
        if (skill.certificateName) mapped.certificateName = skill.certificateName;
        if (skill.startDate) mapped.startDate = new Date(skill.startDate);
        if (skill.endDate) mapped.endDate = new Date(skill.endDate);
        return mapped;
      }),
    });
  }
  updatedStudent = await prisma.student.findUnique({ where: { userId } });
  break;
// ...existing code...

      case "internships":
        await prisma.internship.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.internship.createMany({
            data: data.map((intern: any) => ({
              studentId,
              company: intern.company,
              role: intern.role,
              startDate: new Date(intern.startDate),
              endDate: new Date(intern.endDate),
              location: intern.location,
              responsibilities: intern.responsibilities,
              certificate: intern.certificate,
              certificateName: intern.certificateName,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "events":
        await prisma.enhancementProgram.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.enhancementProgram.createMany({
            data: data.map((event: any) => ({
              studentId,
              name: event.name,
              location: event.location,
              details: event.details,
              contribution: event.contribution,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "socialProfiles":
        await prisma.socialProfile.upsert({
          where: { studentId },
          update: {
            github: data.github,
            gitlab: data.gitlab,
            bitbucket: data.bitbucket,
            linkedin: data.linkedin,
            twitter: data.twitter,
            portfolio: data.portfolio,
          },
          create: {
            studentId,
            github: data.github,
            gitlab: data.gitlab,
            bitbucket: data.bitbucket,
            linkedin: data.linkedin,
            twitter: data.twitter,
            portfolio: data.portfolio,
          },
        });
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "placements":
        await prisma.placement.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.placement.createMany({
            data: data.map((placement: any) => ({
              studentId,
              employer: placement.employer,
              designation: placement.designation,
              onCampus: placement.onCampus,
              ctc: placement.ctc,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "workExperience":
        await prisma.workExperience.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.workExperience.createMany({
            data: data.map((exp: any) => ({
              studentId,
              employer: exp.employer,
              startDate: new Date(exp.startDate),
              endDate: new Date(exp.endDate),
              role: exp.role,
              responsibilities: exp.responsibilities,
              ctc: exp.ctc,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "publications":
        await prisma.publication.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.publication.createMany({
            data: data.map((pub: any) => ({
              studentId,
              title: pub.title,
              abstract: pub.abstract,
              publisher: pub.publisher,
              link: pub.link,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      default:
        return NextResponse.json(
          { error: "Unknown section. Please contact support." },
          { status: 400 }
        );
    }

    // Success: return updated student object
    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (err) {
    // Log error for developers
    console.error(`Error saving section "${section}":`, err);
    // User-friendly error for users
    return NextResponse.json(
      { error: "Failed to save data. Please try again. If the problem persists, contact support." },
      { status: 500 }
    );
  }
}

/**
 * GET handler for fetching the full student record with all sections.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You are not authorized. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const student = await prisma.student.findUnique({
      where: { userId: Number(session.user.id) },
      include: {
        college: true,
        department: true,
        ugDetails: true,
        technicalSkills: true,
        internships: true,
        events: true,
        socialProfiles: true,
        placements: true,
        workExperiences: true,
        publications: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found. Please contact support." },
        { status: 404 }
      );
    }

    // Success: return student object
    return NextResponse.json({ student });
  } catch (err) {
    // Log error for developers
    console.error("Error fetching student record:", err);
    // User-friendly error for users
    return NextResponse.json(
      { error: "Failed to load data. Please try again later." },
      { status: 500 }
    );
  }
}