import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/students/resume
 * Returns mapped student resume data for the current user.
 */
export async function GET() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    return NextResponse.json(
      { error: "Failed to get session." },
      { status: 500 }
    );
  }

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
        technicalSkills: true,
        internships: true,
        events: true,
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

    const response = {
      general: {
        candidate_first_name: student.firstName,
        candidate_last_name: student.lastName,
        photo: student.photo,
        batch: student.batch,
        roll_reg_no: student.rollNo,
        sslc_percentage: student.sslcPercentage,
        hsc_percentage: student.hscPercentage,
        email: student.personalEmailId,
        current_degree: student.department?.name,
        summary: student.summary,
        address: student.address,
        phoneNo: student.phoneNo,
      },
      ugDetails: student.ugDetails ?? {},
      technicalSkills: student.technicalSkills ?? [],
      internships: student.internships ?? [],
      projects: student.projects ?? [],
      events: student.events ?? [],
      socialProfiles: Array.isArray(student.socialProfiles)
        ? student.socialProfiles[0] ?? {}
        : student.socialProfiles ?? {},
      placements: student.placements ?? [],
      workExperience: student.workExperiences ?? [],
      publications: student.publications ?? [],
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Error fetching student resume:", err);
    return NextResponse.json(
      { error: "Failed to load resume data. Please try again later." },
      { status: 500 }
    );
  }
}