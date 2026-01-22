import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, context: any) {
  try {
    const { params } = await context;
    const userId = Number(params.studentId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }
    const sessionUser = await getServerSession(authOptions);
    if (!sessionUser || !sessionUser.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const requestingUser = await prisma.user.findUnique({ where: { email: sessionUser.user.email } });
    if (!requestingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
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
        faculty: { select: { id: true, userId: true, name: true, collegeId: true, departmentId: true, hodId: true, user: { select: { email: true } } } },
        hod: { select: { id: true, userId: true, name: true, collegeId: true, departmentId: true, user: { select: { email: true } } } },
      },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    // Authorization: allow if requesting user is the student's faculty, hod, or college
    const isFaculty = student.faculty?.userId === requestingUser.id;
    const isHod = student.hod?.userId === requestingUser.id;
    const isCollege = student.college?.userId === requestingUser.id;
    if (!isFaculty && !isHod && !isCollege) {
      return NextResponse.json({ error: "Forbidden: You do not have access to this student." }, { status: 403 });
    }
    return NextResponse.json({ student });
  } catch (err) {
    console.error("[GET /api/students/full/[studentId]] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 