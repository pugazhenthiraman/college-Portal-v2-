import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { insertStudents } from "@/utils/helper";

const REQUIRED_COLUMNS = [
  "email", "password", "firstName", "middleName", "rollNo", "DOB", "phoneNo",
  "secondaryPhoneNo", "nationality", "countryCode", "departmentName"
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
      return NextResponse.json({ error: "College ID not found" }, { status: 401 });
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

    const fileColumns = Object.keys(jsonData[0] || {});
    const missingColumns = REQUIRED_COLUMNS.filter(col => !fileColumns.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing columns: ${missingColumns.join(", ")}` }, { status: 400 });
    }

    // Prepare student & user data
    const validData = await Promise.all(
      jsonData.map(async (row: any, index) => {
        const requiredFields = [...REQUIRED_COLUMNS];
        for (const field of requiredFields) {
          if (!row[field]) throw new Error(`Row ${index + 1} is missing required field: ${field}`);
        }

        const hashedPassword = await bcrypt.hash(row.password, 10);

        return {
          email: row.email,
          password: hashedPassword,
          firstName: row.firstName,
          middleName: row.middleName,
          lastName: row.lastName || null,
          rollNo: row.rollNo,
          DOB: new Date(row.DOB),
          phoneNo: row.phoneNo,
          secondaryPhoneNo: row.secondaryPhoneNo,
          nationality: row.nationality,
          countryCode: row.countryCode,
          departmentName: row.departmentName,
          personalEmail: row.personalEmail || null,
          passportNo: row.passportNo || null,
          passportExpiryDate: row.passportExpiryDate ? new Date(row.passportExpiryDate) : null,
          departmentId: Number(row.departmentId) || null,
          facultyId: Number(row.facultyId) || null,
          hodId: Number(row.hodId) || null,
          collegeId,
        };
      })
    );

    const result = await insertStudents(validData);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error("❌ Error in POST /students:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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
