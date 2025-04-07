import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const REQUIRED_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "password",
  "personalEmailId",
  "rollNo",
  "departmentName",
  "DOB",
  "phoneNo",
  "secondaryPhoneNo",
  "country",
  "district",
  "state"
];

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      include: { college: true },
    });

    if (!user?.college) {
      return NextResponse.json({ error: "College not found" }, { status: 401 });
    }
    const collegeId = user.college.id;

    const formData = await req.formData();
    const file = formData.get("studentsExcelData") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: "The Excel file is empty or invalid." }, { status: 400 });
    }

    const fileColumns = Object.keys(jsonData[0] || {}).map((col) => col.trim());
    const missingColumns = REQUIRED_COLUMNS.filter((col) => !fileColumns.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing columns: ${missingColumns.join(", ")}` }, { status: 400 });
    }

    // Fetch all departments for this college
    const departments = await prisma.department.findMany({
      where: { collegeId },
      select: { id: true, name: true },
    });
    const departmentMap: Record<string, number> = {};
    for (const dept of departments) {
      departmentMap[dept.name.toLowerCase()] = dept.id;
    }

    // Fetch all HODs for this college
    const hods = await prisma.hOD.findMany({
      where: { collegeId },
      select: { id: true, departmentId: true },
    });
    const hodMap: Record<number, number> = {};
    for (const hod of hods) {
      hodMap[hod.departmentId] = hod.id;
    }

    const userEmailSet = new Set<string>();
    const rollNoSet = new Set<string>();
    const personalEmailSet = new Set<string>();
    const phoneSet = new Set<string>();

    const usersToInsert: any[] = [];
    const studentRecords: any[] = [];

    for (let index = 0; index < jsonData.length; index++) {
      const row : any = jsonData[index];
      const rowNumber = index + 2;

      const missingFields = REQUIRED_COLUMNS.filter((key) => !row[key]);
      if (missingFields.length) {
        throw new Error(`Row ${rowNumber}: Missing required fields - ${missingFields.join(", ")}`);
      }

      const email = row.email.toString().toLowerCase();
      const personalEmail = row.personalEmailId.toString().toLowerCase();
      const rollNo = row.rollNo.toString();
      const phoneNo = row.phoneNo.toString();
      const departmentName = row.departmentName.toString().toLowerCase();

      if (userEmailSet.has(email)) throw new Error(`Row ${rowNumber}: Duplicate email`);
      if (personalEmailSet.has(personalEmail)) throw new Error(`Row ${rowNumber}: Duplicate personalEmailId`);
      if (rollNoSet.has(rollNo)) throw new Error(`Row ${rowNumber}: Duplicate rollNo`);
      if (phoneSet.has(phoneNo)) throw new Error(`Row ${rowNumber}: Duplicate phoneNo`);

      userEmailSet.add(email);
      personalEmailSet.add(personalEmail);
      rollNoSet.add(rollNo);
      phoneSet.add(phoneNo);

      const departmentId = departmentMap[departmentName];
      if (!departmentId) throw new Error(`Row ${rowNumber}: Invalid department name`);

      const hodId = hodMap[departmentId];
      if (!hodId) throw new Error(`Row ${rowNumber}: No HOD assigned to department`);

      const hashedPassword = await bcrypt.hash(row.password.toString(), 10);
      const dob = new Date(row.DOB);
      if (isNaN(dob.getTime())) throw new Error(`Row ${rowNumber}: Invalid DOB`);

      usersToInsert.push({ email, password: hashedPassword, role: UserRole.STUDENT });

      studentRecords.push({
        email,
        firstName: row.firstName,
        middleName: row.middleName || null,
        lastName: row.lastName,
        rollNo,
        personalEmailId: personalEmail,
        DOB: dob.toISOString(),
        phoneNo,
        secondaryPhoneNo: row.secondaryPhoneNo,
        country: row.country,
        district: row.district,
        state: row.state,
        departmentName: row.departmentName,
        departmentId,
        hodId,
        collegeId
      });
    }

    await prisma.user.createMany({ data: usersToInsert, skipDuplicates: true });

    const createdUsers = await prisma.user.findMany({
      where: { email: { in: usersToInsert.map((u) => u.email) } },
      select: { id: true, email: true },
    });
    const emailToUserId = createdUsers.reduce((acc, curr) => {
      acc[curr.email.toLowerCase()] = curr.id;
      return acc;
    }, {} as Record<string, number>);

   const values = studentRecords
  .map((item) => {
    const userId = emailToUserId[item.email];
    if (!userId) return null;

    const dobString = item.DOB ? `'${item.DOB}'` : 'NULL';
    const middleName = item.middleName ? `'${item.middleName.replace(/'/g, "''")}'` : 'NULL';

    return `(
      ${userId},
      '${item.firstName.replace(/'/g, "''")}',
      ${middleName},
      '${item.lastName.replace(/'/g, "''")}',
      '${item.rollNo}',
      '${item.personalEmailId}',
      ${dobString},
      '${item.phoneNo}',
      '${item.secondaryPhoneNo}',
      '${item.country.replace(/'/g, "''")}',
      '${item.district.replace(/'/g, "''")}',
      '${item.state.replace(/'/g, "''")}',
      '${item.departmentName.replace(/'/g, "''")}',
      ${item.collegeId},
      ${item.departmentId},
      ${item.hodId}
    )`;
  })
  .filter(Boolean)
  .join(",");

   if (!values) {
  console.error("No valid student data to insert.");
  return NextResponse.json({ error: "No valid students to insert" }, { status: 400 });
}

  

  await prisma.$executeRawUnsafe(`
    INSERT INTO "Student" (
      "userId", "firstName", "middleName", "lastName", "rollNo",
      "personalEmailId", "DOB", "phoneNo", "secondaryPhoneNo",
      "country", "district", "state", "departmentName", "collegeId",
      "departmentId", "hodId"
    )
    VALUES ${values}
    ON CONFLICT ("rollNo") DO UPDATE SET
      "firstName" = EXCLUDED."firstName",
      "middleName" = EXCLUDED."middleName",
      "lastName" = EXCLUDED."lastName",
      "personalEmailId" = EXCLUDED."personalEmailId",
      "DOB" = EXCLUDED."DOB",
      "phoneNo" = EXCLUDED."phoneNo",
      "secondaryPhoneNo" = EXCLUDED."secondaryPhoneNo",
      "country" = EXCLUDED."country",
      "district" = EXCLUDED."district",
      "state" = EXCLUDED."state",
      "departmentName" = EXCLUDED."departmentName",
      "collegeId" = EXCLUDED."collegeId",
      "departmentId" = EXCLUDED."departmentId",
      "hodId" = EXCLUDED."hodId";
  `);


    return NextResponse.json({ success: true, message: "Students inserted successfully" });
  } catch (error: any) {
    console.error("❌ Error uploading students:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}



export async function GET() {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      include: { college: true },
    });

    if (!user?.college) {
      return NextResponse.json({ error: "College ID not found" }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      where: { collegeId: user.college.id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
