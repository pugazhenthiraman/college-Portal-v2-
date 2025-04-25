// File: app/api/college/upload-student/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// ← import your password generator
import { generateInitialPassword } from "@/lib/generatePassword";

const REQUIRED_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  // "password",  ← no longer required
  "personalEmailId",
  "rollNo",
  "departmentName",
  "DOB",
  "phoneNo",
  "secondaryPhoneNo",
  "country",
  "district",
  "state",
];

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) figure out which college this user belongs to
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      include: { college: true },
    });
    if (!currentUser?.college) {
      return NextResponse.json({ error: "College not found" }, { status: 401 });
    }
    const collegeId = currentUser.college.id;

    // 2) pull the uploaded file
    const formData = await req.formData();
    const file = formData.get("studentsExcelData") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3) parse the sheet
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

    if (!rawRows.length) {
      return NextResponse.json({ error: "Excel is empty or invalid" }, { status: 400 });
    }

    // 4) check required columns
    const cols = Object.keys(rawRows[0]).map((c) => c.trim());
    const missingCols = REQUIRED_COLUMNS.filter((c) => !cols.includes(c));
    if (missingCols.length) {
      return NextResponse.json(
        { error: `Missing columns: ${missingCols.join(", ")}` },
        { status: 400 }
      );
    }

    // 5) preload departments & HODs for lookups
    const depts = await prisma.department.findMany({
      where: { collegeId },
      select: { id: true, name: true },
    });
    const deptMap = Object.fromEntries(
      depts.map((d) => [d.name.toLowerCase(), d.id])
    );

    const hods = await prisma.hOD.findMany({
      where: { collegeId },
      select: { id: true, departmentId: true },
    });
    const hodMap = Object.fromEntries(
      hods.map((h) => [h.departmentId, h.id])
    );

    // 6) de-duplicate sets
    const seenEmail = new Set<string>();
    const seenPersonalEmail = new Set<string>();
    const seenRoll = new Set<string>();
    const seenPhone = new Set<string>();

    // 7) accumulate User + Student inserts
    const users: { email: string; password: string; role: UserRole }[] = [];
    const studentRows: Array<{
      email: string;
      firstName: string;
      middleName?: string | null;
      lastName: string;
      rollNo: string;
      personalEmailId: string;
      DOB: Date;
      phoneNo: string;
      secondaryPhoneNo: string;
      country: string;
      district: string;
      state: string;
      departmentName: string;
      departmentId: number;
      hodId: number;
      collegeId: number;
    }> = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rnum = i + 2; // for error messages

      // a) basic presence
      const missing = REQUIRED_COLUMNS.filter((key) => !row[key]);
      if (missing.length) {
        throw new Error(`Row ${rnum}: missing ${missing.join(", ")}`);
      }

      const email = String(row.email).trim().toLowerCase();
      const personalEmail = String(row.personalEmailId).trim().toLowerCase();
      const rollNo = String(row.rollNo).trim();
      const phoneNo = String(row.phoneNo).trim();
      const deptName = String(row.departmentName).trim().toLowerCase();

      // b) duplicates in this upload
      if (seenEmail.has(email)) throw new Error(`Row ${rnum}: duplicate email`);
      if (seenPersonalEmail.has(personalEmail))
        throw new Error(`Row ${rnum}: duplicate personal email`);
      if (seenRoll.has(rollNo)) throw new Error(`Row ${rnum}: duplicate rollNo`);
      if (seenPhone.has(phoneNo)) throw new Error(`Row ${rnum}: duplicate phoneNo`);

      seenEmail.add(email);
      seenPersonalEmail.add(personalEmail);
      seenRoll.add(rollNo);
      seenPhone.add(phoneNo);

      // c) department → id
      const departmentId = deptMap[deptName];
      if (!departmentId)
        throw new Error(`Row ${rnum}: unknown department "${row.departmentName}"`);

      // d) HOD for that department
      const hodId = hodMap[departmentId];
      if (!hodId)
        throw new Error(`Row ${rnum}: no HOD for department "${row.departmentName}"`);

      // e) parse date
      const dob = new Date(row.DOB);
      if (isNaN(dob.getTime())) throw new Error(`Row ${rnum}: invalid DOB`);

      // f) generate & hash the one-time password
      const plain = generateInitialPassword({ role: UserRole.STUDENT, firstName: row.firstName, dob });
      const hashed = await bcrypt.hash(plain, 10);

      users.push({ email, password: hashed, role: UserRole.STUDENT });

      studentRows.push({
        email,
        firstName: String(row.firstName).trim(),
        middleName: row.middleName ? String(row.middleName).trim() : null,
        lastName: String(row.lastName).trim(),
        rollNo,
        personalEmailId: personalEmail,
        DOB: dob,
        phoneNo,
        secondaryPhoneNo: String(row.secondaryPhoneNo).trim(),
        country: String(row.country).trim(),
        district: String(row.district).trim(),
        state: String(row.state).trim(),
        departmentName: row.departmentName,
        departmentId,
        hodId,
        collegeId,
      });
    }

    // 8) bulk insert Users (skip existing)
    await prisma.user.createMany({
      data: users,
      skipDuplicates: true,
    });

    // 9) fetch their new IDs
    const created = await prisma.user.findMany({
      where: { email: { in: users.map((u) => u.email) } },
      select: { id: true, email: true },
    });
    const emailToId = Object.fromEntries(
      created.map((u) => [u.email.toLowerCase(), u.id])
    );

    // 10) upsert each Student
    for (const s of studentRows) {
      const uid = emailToId[s.email.toLowerCase()];
      await prisma.student.upsert({
        where: { rollNo: s.rollNo },
        create: {
          userId: uid,
          firstName: s.firstName,
          middleName: s.middleName,
          lastName: s.lastName,
          rollNo: s.rollNo,
          personalEmailId: s.personalEmailId,
          DOB: s.DOB,
          phoneNo: s.phoneNo,
          secondaryPhoneNo: s.secondaryPhoneNo,
          country: s.country,
          district: s.district,
          state: s.state,
          departmentName: s.departmentName,
          collegeId: s.collegeId,
          departmentId: s.departmentId,
          hodId: s.hodId,
        },
        update: {
          firstName: s.firstName,
          middleName: s.middleName,
          lastName: s.lastName,
          personalEmailId: s.personalEmailId,
          DOB: s.DOB,
          phoneNo: s.phoneNo,
          secondaryPhoneNo: s.secondaryPhoneNo,
          country: s.country,
          district: s.district,
          state: s.state,
          departmentName: s.departmentName,
          collegeId: s.collegeId,
          departmentId: s.departmentId,
          hodId: s.hodId,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Students upserted" });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // only show students for this college
    const u = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      include: { college: true },
    });
    if (!u?.college) {
      return NextResponse.json({ error: "No college" }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      where: { collegeId: u.college.id },
      include: { user: { select: { email: true } } },
    });
    return NextResponse.json({ students });
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export const config = { api: { bodyParser: false } };
