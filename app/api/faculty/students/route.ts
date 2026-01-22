import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const facultyRecord = await prisma.faculty.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true, collegeId: true, departmentId: true },
    });
    if (!facultyRecord) {
      return NextResponse.json({ error: "Faculty record not found" }, { status: 404 });
    }

    const department = await prisma.department.findUnique({
      where: { id: facultyRecord.departmentId },
      select: { name: true },
    });

    const students = await prisma.student.findMany({
      where: {
        facultyId: facultyRecord.id,
        departmentId: facultyRecord.departmentId,
        collegeId: facultyRecord.collegeId,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        DOB: true,
        phoneNo: true,
        personalEmailId: true,
        academicYear: true,
        section: true,
        user: { select: { email: true } },
        isSubmitted: true,
        isVerified: true,
      },
    });

    const studentsWithEmail = students.map(s => ({
      ...s,
      email: s.user?.email ?? "",
      departmentName: department?.name ?? "",
      status: "Active", // or any logic you want
    }));

    return NextResponse.json({ students: studentsWithEmail, department: department?.name ?? "" });
  } catch (err: any) {
    console.error("API ERROR /api/faculty/students:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}