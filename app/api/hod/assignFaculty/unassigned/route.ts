import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find HOD context
  const hod = await prisma.hOD.findUnique({
    where: { userId: Number(session.user.id) },
    select: { id: true, departmentId: true, collegeId: true },
  });
  if (!hod) {
    return NextResponse.json({ error: "HOD not found" }, { status: 404 });
  }

  // Get all students for this HOD/department/college
  const students = await prisma.student.findMany({
    where: {
      hodId: hod.id,
      departmentId: hod.departmentId,
      collegeId: hod.collegeId,
    },
    select: {
      section: true,
      academicYear: true,
      facultyId: true,
    },
  });

  // Group by section+year
  const sectionMap: Record<string, {
    section: string;
    academicYear: string;
    total: number;
    assigned: number;
    unassigned: number;
  }> = {};

  students.forEach(s => {
    if (!s.section) return;
    const key = `${s.section}__${s.academicYear}`;
    if (!sectionMap[key]) {
      sectionMap[key] = {
        section: s.section,
        academicYear: s.academicYear || "Unknown",
        total: 0,
        assigned: 0,
        unassigned: 0,
      };
    }
    sectionMap[key].total += 1;
    if (s.facultyId) sectionMap[key].assigned += 1;
    else sectionMap[key].unassigned += 1;
  });

  // Only return sections with unassigned students
  const result = Object.values(sectionMap).filter(s => s.unassigned > 0);

  return NextResponse.json({ sections: result });
}