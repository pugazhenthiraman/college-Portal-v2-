import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    console.log("API /hod/students GET called with URL:", req.url);

    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hodRecord = await prisma.hOD.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true, collegeId: true, departmentId: true },
    });
    if (!hodRecord) {
      return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
    }

    const department = await prisma.department.findUnique({
      where: { id: hodRecord.departmentId },
      select: { name: true },
    });

    const [facultyList, students] = await Promise.all([
      prisma.faculty.findMany({
        where: {
          hodId:        hodRecord.id,
          departmentId: hodRecord.departmentId,
          collegeId:    hodRecord.collegeId,
        },
        select: {
          userId: true,
          name:   true,
        },
      }),
      prisma.student.findMany({
        where: {
          hodId:        hodRecord.id,
          departmentId: hodRecord.departmentId,
          collegeId:    hodRecord.collegeId,
        },
        select: {
          userId:           true,
          firstName:        true,
          lastName:         true,
          rollNo:           true,
          DOB:              true,
          phoneNo:          true,
          personalEmailId:  true,
          academicYear:     true,
          section:          true,
          departmentName:   true,
          facultyId:        true, // <-- make sure this is selected
          user: { 
            select: { email: true } 
          },
          faculty: {
            select: { name: true }
          }
        },
      }),
    ]);

    const studentsWithFacultyName = students.map(s => ({
      userId:         s.userId,
      firstName:      s.firstName,
      lastName:       s.lastName,
      rollNo:         s.rollNo,
      DOB:            s.DOB,
      phoneNo:        s.phoneNo,
      personalEmailId:s.personalEmailId,
      email:          s.user.email,
      academicYear:   s.academicYear,
      section:        s.section,
      departmentName: s.departmentName,
      facultyName:    s.faculty?.name ?? "N/A",
      facultyId:      s.facultyId, // <-- optional, for debugging
    }));

    return NextResponse.json({
      students:   studentsWithFacultyName,
      faculty:    facultyList,
      department: department?.name ?? "N/A",
    });
  } catch (err: any) {
    console.error("Error in GET /api/hod/students:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}