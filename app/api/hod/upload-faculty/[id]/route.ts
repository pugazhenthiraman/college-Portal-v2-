// File: app/api/hod/upload-faculty/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

const SALT_ROUNDS = 10;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1) Auth & role check
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Ensure this HOD exists and grab their dept/college IDs
  const hodRecord = await prisma.hOD.findUnique({
    where: { userId: Number(session.user.id) },
    select: { collegeId: true, departmentId: true, id: true },
  });
  if (!hodRecord) {
    return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
  }

  // 3) Parse & validate the dynamic userId
  const userId = Number(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // 4) Read body
  const { email, password, name, contactNo, aadhaarNo } = await req.json();

  // 5) Update the User table if needed
  let updatedUser = null;
  if (email || password) {
    const userData: Record<string, any> = {};
    if (email)    userData.email    = email;
    if (password) userData.password = await bcrypt.hash(password, SALT_ROUNDS);

    updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
    });
  }

  // 6) Update the Faculty record
  const updatedFaculty = await prisma.faculty.update({
    where: { userId },
    data: {
      name,
      contactNo,
      aadhaarNo,
      // ensure they stay in this HOD's department
      departmentId: hodRecord.departmentId,
      collegeId:    hodRecord.collegeId,
      hodId:        hodRecord.id,
    },
  });

  // 7) Return both updates
  return NextResponse.json({ updatedUser, updatedFaculty });
}
