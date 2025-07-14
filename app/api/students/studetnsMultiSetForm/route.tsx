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
  "projects",
] as const;
type Section = typeof ALLOWED_SECTIONS[number];

/**
 * POST handler for saving/updating student multi-section form data.
 * Expects: { section: string, data: any }
 */
export async function POST(req: NextRequest) {
  console.log("🛠 [backend] POST /api/students/studetnsMultiSetForm called");
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
      { error: `Section "${String(section)}" is not supported.` },
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
    switch (section) {
      case "general":
        updatedStudent = await prisma.student.update({
          where: { userId },
          data: {
            firstName: data.candidate_first_name,
            lastName: data.candidate_last_name,
            photo: data.photo ?? null,
            batch: data.batch,
            rollNo: data.roll_reg_no,
            sslcPercentage: data.sslc_percentage,
            hscPercentage: data.hsc_percentage,
            personalEmailId: data.email,
            country: data.country,
            district: data.district,
            state: data.state,
            departmentName: data.departmentName,
            section: data.section,
            academicYear: data.academicYear,
            adhaarNo: data.adhaarNo,
            passportNo: data.passportNo,
            passportExpiryDate: data.passportExpiryDate ? new Date(data.passportExpiryDate) : null,
            DOB: data.DOB ? new Date(data.DOB) : undefined,
            phoneNo: data.phoneNo,
            secondaryPhoneNo: data.secondaryPhoneNo,
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

      case "technicalSkills":
        await prisma.technicalSkill.deleteMany({ where: { studentId } });
        if (Array.isArray(data) && data.length > 0) {
          await prisma.technicalSkill.createMany({
            data: data.map((skill: any) => ({
              studentId,
              courseName: skill.courseName || "",
              details: skill.details || "",
              level: skill.level?.toUpperCase() ?? "BEGINNER",
              certificateFile: skill.certificateFile || null,
              certificateName: skill.certificateName || null,
              startDate: skill.startDate ? new Date(skill.startDate) : null,
              endDate: skill.endDate ? new Date(skill.endDate) : null,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

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
              certificate: intern.certificate || null,
              certificateName: intern.certificateName || null,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "events":
        await prisma.enhancementProgram.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.enhancementProgram.createMany({
            data: data.map((evt: any) => ({
              studentId,
              name: evt.name,
              location: evt.location,
              details: evt.details,
              contribution: evt.contribution,
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
            data: data.map((pl: any) => ({
              studentId,
              employer: pl.employer,
              designation: pl.designation,
              onCampus: pl.onCampus,
              ctc: pl.ctc,
            })),
          });
        }
        updatedStudent = await prisma.student.findUnique({ where: { userId } });
        break;

      case "workExperience":
        await prisma.workExperience.deleteMany({ where: { studentId } });
        if (Array.isArray(data)) {
          await prisma.workExperience.createMany({
            data: data.map((we: any) => ({
              studentId,
              employer: we.employer,
              role: we.role,
              responsibilities: we.responsibilities,
              ctc: we.ctc,
              startDate: we.startDate ? new Date(we.startDate) : null,
              endDate: we.endDate ? new Date(we.endDate) : null,
              certificate: we.certificate || null,         // <-- add this
              certificateName: we.certificateName || null, // <-- add this
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

        case "projects":
          // Remove all previous projects for this student
          await prisma.project.deleteMany({ where: { studentId } });
          // Only create if there are projects
          if (Array.isArray(data)) {
            await prisma.project.createMany({
              data: data.map((prj: any) => ({
                studentId,
                title: prj.title,
                link: prj.link || null,
                startDate: new Date(prj.startDate),
                endDate: new Date(prj.endDate),
                description: prj.description,
                category: prj.category || null,      // <-- save category
                githubRepo: prj.githubRepo || null,  // <-- save githubRepo
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

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (err) {
    console.error(`Error saving section "${section}":`, err);
    return NextResponse.json(
      { error: "Failed to save data. Please try again later." },
      { status: 500 }
    );
  }
}

/**
 * GET handler for fetching the full student record with all sections.
 */
export async function GET() {
  console.log("🛠 [backend] GET /api/students/studetnsMultiSetForm called");
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You are not authorized. Please log in again." },
      { status: 401 }
    );
  }

  try {
    const userId = Number(session.user.id);
   const student = await prisma.student.findUnique({
  where: { userId },
  include: {
    college: true,
    department: true,
    ugDetails: true,
    technicalSkills: true,       // ✅ correct key
    internships: true,
    events: true,                // ✅ correct key (not enhancementPrograms)
    socialProfiles: true,
    placements: true,
    workExperiences: true,
    publications: true,
    projects: true,
  },
});

    

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found. Please contact support." },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (err) {
    console.error("Error fetching student record:", err);
    return NextResponse.json(
      { error: "Failed to load data. Please try again later." },
      { status: 500 }
    );
  }
}