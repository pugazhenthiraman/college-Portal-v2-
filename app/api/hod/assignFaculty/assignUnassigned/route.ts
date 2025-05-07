import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { year, section, facultyId } = await req.json();

    if (!year || !section || !facultyId) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Get HOD context
    const hod = await prisma.hOD.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true, departmentId: true, collegeId: true },
    });
    if (!hod) {
      return NextResponse.json({ error: "HOD not found." }, { status: 404 });
    }

    // Check faculty is valid and belongs to this HOD
    const faculty = await prisma.faculty.findUnique({
      where: { id: Number(facultyId) },
      select: { id: true, hodId: true, departmentId: true, collegeId: true },
    });
    if (
      !faculty ||
      faculty.hodId !== hod.id ||
      faculty.departmentId !== hod.departmentId ||
      faculty.collegeId !== hod.collegeId
    ) {
      return NextResponse.json({ error: "Invalid faculty." }, { status: 400 });
    }

    // Assign all unassigned students in this year/section to the faculty
    const result = await prisma.student.updateMany({
      where: {
        hodId: hod.id,
        departmentId: hod.departmentId,
        academicYear: year,
        section,
        facultyId: null,
      },
      data: { facultyId: faculty.id },
    });

    // Optionally, update faculty.sections if needed
    const fac = await prisma.faculty.findUnique({ where: { id: faculty.id } });
    if (fac && fac.sections && !fac.sections.includes(section)) {
      await prisma.faculty.update({
        where: { id: faculty.id },
        data: { sections: { push: section } },
      });
    }

    return NextResponse.json({
      success: true,
      updated: result.count,
      message: `Assigned ${result.count} students to faculty.`,
    });
  } catch (err: any) {
    console.error("Assign unassigned error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}