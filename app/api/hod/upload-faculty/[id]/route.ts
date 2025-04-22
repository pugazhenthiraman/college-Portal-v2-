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
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // verify HOD record
  const hodRecord = await prisma.hOD.findUnique({
    where: { userId: Number(session.user.id) },
    select: { collegeId: true, departmentId: true, id: true },
  });
  if (!hodRecord) {
    return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
  }

  const userId = Number(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  const body = await req.json();

  let updatedUser = null;
  if (body.email || body.password) {
    const data: any = {};
    if (body.email) data.email = body.email;
    if (body.password) {
      data.password = await bcrypt.hash(body.password, SALT_ROUNDS);
    }
    updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  const updatedFaculty = await prisma.faculty.update({
    where: { userId },
    data: {
      name:         body.name,
      contactNo:    body.contactNo,
      aadhaarNo:    body.aadhaarNo,
      departmentId: hodRecord.departmentId,
    },
  });

  return NextResponse.json({ updatedUser, updatedFaculty });
}
