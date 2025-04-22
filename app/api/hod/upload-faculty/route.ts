// File: app/api/hod/upload-faculty/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

// The exact Excel columns we expect (trimmed, no extra spaces)
const REQUIRED_HEADERS = [
  "Name",
  "Email",
  "Password",
  "Mobile No",
  "Aadhaar No",
];

export async function POST(req: NextRequest) {
  // 1) Auth & role check
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Lookup HOD’s collegeId, departmentId & hodId
  const hodRecord = await prisma.hOD.findUnique({
    where: { userId: Number(session.user.id) },
    select: { collegeId: true, departmentId: true, id: true },
  });
  if (!hodRecord) {
    return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
  }
  const { collegeId, departmentId, id: hodId } = hodRecord;

  // 3) Get the uploaded file
  const formData = await req.formData();
  const file = formData.get("facultyExcelData");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // 4) Read workbook & first sheet
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  // 5) Extract and trim headers
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
  if (rawRows.length === 0) {
    return NextResponse.json({ error: "Excel file is empty" }, { status: 400 });
  }
  const headers = (rawRows[0] as string[]).map((h) => h.trim());

  // 6) Validate headers
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  const extra = headers.filter((h) => !REQUIRED_HEADERS.includes(h));
  if (missing.length || extra.length) {
    let msg = "";
    if (missing.length) msg += `Missing columns: ${missing.join(", ")}. `;
    if (extra.length)   msg += `Unexpected columns: ${extra.join(", ")}.`;
    return NextResponse.json({ error: msg.trim() }, { status: 400 });
  }

  // 7) Parse data rows using trimmed headers
  const dataRows: any[] = XLSX.utils.sheet_to_json(sheet, {
    header: headers,
    defval: "",
    range: 1,
  });

  // 8) Server-side duplicate/missing checks
  const seen = { email: new Set<string>(), phone: new Set<string>(), aad: new Set<string>() };
  for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 2;
    const r = dataRows[i];
    const email = String(r["Email"] || "").trim();
    const phone = String(r["Mobile No"] || "").trim();
    const aadhaar = String(r["Aadhaar No"] || "").trim();

    if (!email || !phone || !aadhaar) {
      return NextResponse.json(
        { error: `Row ${rowNum}: missing Email, Mobile No or Aadhaar No` },
        { status: 400 }
      );
    }
    if (seen.email.has(email)) {
      return NextResponse.json(
        { error: `Row ${rowNum}: duplicate Email ${email}` },
        { status: 400 }
      );
    }
    if (seen.phone.has(phone)) {
      return NextResponse.json(
        { error: `Row ${rowNum}: duplicate Mobile No ${phone}` },
        { status: 400 }
      );
    }
    if (seen.aad.has(aadhaar)) {
      return NextResponse.json(
        { error: `Row ${rowNum}: duplicate Aadhaar No ${aadhaar}` },
        { status: 400 }
      );
    }
    seen.email.add(email);
    seen.phone.add(phone);
    seen.aad.add(aadhaar);
  }

  // 9) Transactionally upsert all rows
  const upserted: Array<{ userId: number; name: string; email: string }> = [];
  await prisma.$transaction(async (tx) => {
    for (const r of dataRows) {
      const name      = String(r["Name"]).trim();
      const email     = String(r["Email"]).trim();
      const password  = String(r["Password"]);
      const contactNo = String(r["Mobile No"]).trim();
      const aadhaarNo = String(r["Aadhaar No"]).trim();

      // Sanity check
      if (!name || !email || !password || !contactNo) {
        throw new Error("Validation failed: missing required field");
      }

      // a) Upsert User
      const hashed = await bcrypt.hash(password, 10);
      const user = await tx.user.upsert({
        where:  { email },
        create: { email, password: hashed, role: "FACULTY" },
        update: { password: hashed, role: "FACULTY" },
      });

      // b) Upsert Faculty (use `user.id` explicitly)
      await tx.faculty.upsert({
        where: { userId: user.id },
        create: {
          userId:       user.id,
          name,
          collegeId,
          departmentId,
          hodId,
          contactNo,
          aadhaarNo,
        },
        update: {
          name,
          contactNo,
          aadhaarNo,
        },
      });

      upserted.push({ userId: user.id, name, email });
    }
  });

  return NextResponse.json({ faculty: upserted });
}

export async function GET(req: NextRequest) {
  // 1) Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Lookup HOD’s collegeId, departmentId & hodId
  const hodRecord = await prisma.hOD.findUnique({
    where:  { userId: Number(session.user.id) },
    select: { collegeId: true, departmentId: true, id: true },
  });
  if (!hodRecord) {
    return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
  }
  const { collegeId, departmentId, id: hodId } = hodRecord;

  // 3) Fetch only faculty in that college, department AND under this HOD
  const faculty = await prisma.faculty.findMany({
    where:   { collegeId, departmentId, hodId },
    include: { user: { select: { email: true } } },
  });

  // 4) Format response
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
}
