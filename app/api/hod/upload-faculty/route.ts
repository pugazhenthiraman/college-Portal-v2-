import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import { Readable } from "stream";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hodId = Number(session.user.id);
  const collegeId = session.user.collegeId;
  const departmentId = session.user.departmentId;

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet) as any[];

  const requiredFields = ["name", "email", "password", "contactNo", "aadhaarNo"];
  const missingFields = requiredFields.filter((field) => !(field in rows[0]));

  if (missingFields.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(", ")}` },
      { status: 400 }
    );
  }

  const createdFaculty: any[] = [];

  for (const row of rows) {
    const existingUser = await prisma.user.findUnique({
      where: { email: row.email },
    });

    if (existingUser) continue; // skip duplicates

    const hashedPassword = await bcrypt.hash(row.password, 10);

    const user = await prisma.user.create({
      data: {
        email: row.email,
        password: hashedPassword,
        role: "FACULTY",
      },
    });

    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        name: row.name,
        collegeId,
        departmentId,
        hodId,
        contactNo: row.contactNo,
        aadhaarNo: row.aadhaarNo,
      },
      include: {
        user: true,
      },
    });

    createdFaculty.push(faculty);
  }

  return NextResponse.json({ success: true, inserted: createdFaculty.length });
}
