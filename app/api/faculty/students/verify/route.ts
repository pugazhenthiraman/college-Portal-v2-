import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * POST /api/faculty/students/verify
 * Body: { studentId: number, action: "verify" | "reject", remarks?: string }
 * Only accessible by FACULTY.
 */
export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const faculty = await prisma.faculty.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true, userId: true },
    });
    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }
    const { studentId, action, remarks } = await req.json();
    if (!studentId || !["verify", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    // Find the student and ensure this faculty is assigned
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, facultyId: true, userId: true, firstName: true, lastName: true },
    });
    if (!student || student.facultyId !== faculty.id) {
      return NextResponse.json({ error: "Student not found or not assigned to you" }, { status: 404 });
    }
    // Update student verification status
    const isVerified = action === "verify";
    await prisma.student.update({
      where: { id: studentId },
      data: {
        isVerified,
        facultyRemarks: remarks || null,
        verifiedAt: new Date(),
      },
    });
    // Update only the latest pending notification (if any)
    const latestNotification = await prisma.notification.findFirst({
      where: {
        relatedStudentId: studentId,
        receiverId: faculty.userId,
        status: "action_required",
      },
      orderBy: { createdAt: "desc" },
    });
    if (latestNotification) {
      await prisma.notification.update({
        where: { id: latestNotification.id },
        data: {
          status: isVerified ? "success" : "error",
          message: isVerified
            ? `Student ${student.firstName} ${student.lastName}'s profile has been verified.`
            : `Student ${student.firstName} ${student.lastName}'s profile has been rejected.`,
          read: true,
          ...(remarks !== undefined ? { remarks } : {}),
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Faculty Verify] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 