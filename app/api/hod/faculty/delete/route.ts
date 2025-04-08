import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { searchParams } = new URL(req.url);
    const facultyAdvisorId = searchParams.get("facultyAdvisor");

    if (!facultyAdvisorId || isNaN(Number(facultyAdvisorId))) {
      return NextResponse.json({ error: "Invalid or missing facultyAdvisor id" }, { status: 400 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Step 1: Validate password
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, currentUser.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }

    // Step 2: Get faculty and linked userId
    const faculty = await prisma.faculty.findUnique({
      where: { id: Number(facultyAdvisorId) },
      select: { userId: true },
    });

    if (!faculty) {
      return NextResponse.json({ error: "Faculty advisor not found" }, { status: 404 });
    }

    // Step 3: Delete faculty and related user
    await prisma.$transaction([
      prisma.faculty.delete({
        where: { id: Number(facultyAdvisorId) },
      }),
      prisma.user.delete({
        where: { id: faculty.userId },
      }),
    ]);

    return NextResponse.json({ message: "Faculty advisor deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting faculty advisor:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
