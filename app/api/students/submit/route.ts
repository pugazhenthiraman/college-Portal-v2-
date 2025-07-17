import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Find the student by user email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const student = await prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    // Update submission status
    await prisma.student.update({
      where: { id: student.id },
      data: {
        isSubmitted: true,
        submittedAt: new Date(),
        isVerified: null,
        facultyRemarks: null,
        verifiedAt: null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] Student submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 