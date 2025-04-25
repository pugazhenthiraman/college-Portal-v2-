// File: app/api/hod/upload-faculty/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hod = await prisma.hOD.findUnique({
      where:  { userId: Number(session.user.id) },
      select: { collegeId: true, departmentId: true, id: true },
    });
    if (!hod) {
      return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
    }
    const { collegeId, departmentId, id: hodId } = hod;

    // Expect JSON array of faculty entries
    const payload = await req.json();
    if (!Array.isArray(payload)) {
      return NextResponse.json({ error: "Expected JSON array" }, { status: 400 });
    }

    const upserted: Array<{ userId: number; name: string; email: string }> = [];

    await prisma.$transaction(async (tx) => {
      for (const row of payload) {
        const { name, email, contactNo, aadhaarNo, password } = row;
        if (!name || !email || !contactNo || !aadhaarNo || !password) {
          throw new Error("Missing required field in payload");
        }

        // upsert User
        const hashed = await bcrypt.hash(password, 10);
        const user = await tx.user.upsert({
          where:  { email },
          create: { email, password: hashed, role: UserRole.FACULTY },
          update: { password: hashed, role: UserRole.FACULTY },
        });

        // upsert Faculty
        await tx.faculty.upsert({
          where: { userId: user.id },
          create: { userId: user.id, name, collegeId, departmentId, hodId, contactNo, aadhaarNo },
          update: { name, contactNo, aadhaarNo },
        });

        upserted.push({ userId: user.id, name, email });
      }
    });

    return NextResponse.json({ faculty: upserted });
  } catch (err: any) {
    console.error("⚠️ /api/hod/upload-faculty error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HOD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hod = await prisma.hOD.findUnique({
      where:  { userId: Number(session.user.id) },
      select: { collegeId: true, departmentId: true, id: true },
    });
    if (!hod) {
      return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
    }
    const { collegeId, departmentId, id: hodId } = hod;

    const faculty = await prisma.faculty.findMany({
      where:   { collegeId, departmentId, hodId },
      include: { user: { select: { email: true } } },
    });

    const formatted = faculty.map((f) => ({
      id:        f.id,
      userId:    f.userId,
      name:      f.name,
      email:     f.user.email,
      contactNo: f.contactNo,
      aadhaarNo: f.aadhaarNo,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ faculty: formatted });
  } catch (err: any) {
    console.error("⚠️ GET /api/hod/upload-faculty error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
