import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { insertStudents } from "@/utils/helper";

// New required columns based on the updated Excel worksheet template
const REQUIRED_COLUMNS = [
  "firstName",
  "lastName",
  "email",              // For the User record
  "password",           // For the User record (to be hashed)
  "personalEmailId",    // For the Student record
  "rollNo",
  "departmentName",     // This now appears in the proper column per your template
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
      return NextResponse.json({ error: "College ID not found" }, { status: 401 });
    }
    const collegeId = user.college.id;

    const formData = await req.formData();
    const file = formData.get("studentsExcelData") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file using XLSX and convert the first sheet to JSON
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Check if file contains any rows
    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json(
        { error: "The Excel file is empty or invalid." },
        { status: 400 }
      );
    }

    // Get the columns from the first row and trim them
    const fileColumns = Object.keys(jsonData[0] || {});
    const trimmedColumns = fileColumns.map((col) => col.trim());
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !trimmedColumns.includes(col)
    );
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing columns: ${missingColumns.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch valid department names for the college (in lowercase for case-insensitive matching)
    const validDepartments = await prisma.department.findMany({
      where: { collegeId },
      select: { name: true },
    });
    const validDepartmentNames = validDepartments.map(dep =>
      dep.name.toLowerCase()
    );

    // Sets for duplicate checking
    const userEmailSet = new Set<string>();
    const personalEmailSet = new Set<string>();
    const rollNoSet = new Set<string>();
    const phoneSet = new Set<string>();

    // Map rows asynchronously to allow for password hashing, validation, and department lookup
    const validData = await Promise.all(
      jsonData.map(async (row: any, index: number) => {
        // Gather missing fields for this row
        const missingForRow = REQUIRED_COLUMNS.filter(field => !row[field]);
        if (missingForRow.length > 0) {
          throw new Error(
            `Row ${index + 1} is missing required fields: ${missingForRow.join(", ")}`
          );
        }

        // Normalize and check duplicates for user email (for User table)
        const userEmail = row.email.toString().toLowerCase();
        if (userEmailSet.has(userEmail)) {
          throw new Error(`Row ${index + 1} has duplicate email: ${row.email}`);
        }
        userEmailSet.add(userEmail);

        // Normalize and check duplicates for student personal email
        const personalEmail = row.personalEmailId.toString().toLowerCase();
        if (personalEmailSet.has(personalEmail)) {
          throw new Error(`Row ${index + 1} has duplicate personalEmailId: ${row.personalEmailId}`);
        }
        personalEmailSet.add(personalEmail);

        // Check duplicate roll number within file
        const rollNo = row.rollNo.toString();
        if (rollNoSet.has(rollNo)) {
          throw new Error(`Row ${index + 1} has duplicate rollNo: ${row.rollNo}`);
        }
        rollNoSet.add(rollNo);

        // Check duplicate phone number within file
        const phoneNo = row.phoneNo.toString();
        if (phoneSet.has(phoneNo)) {
          throw new Error(`Row ${index + 1} has duplicate phoneNo: ${row.phoneNo}`);
        }
        phoneSet.add(phoneNo);

        // Validate department name (case-insensitive)
        if (!validDepartmentNames.includes(row.departmentName.toString().toLowerCase())) {
          throw new Error(`Row ${index + 1} has invalid department name: ${row.departmentName}`);
        }

        // Look up the department record by name and collegeId
        const departmentRecord = await prisma.department.findFirst({
          where: {
            name: { equals: row.departmentName.trim(), mode: "insensitive" },
            collegeId: collegeId,
          },
        });
        if (!departmentRecord) {
          throw new Error(`Row ${index + 1}: No matching department found for department name: ${row.departmentName}`);
        }

        // Update row.departmentName to match the true department name from the DB
        row.departmentName = departmentRecord.name;

        // ----- Begin DOB Validation -----
        const dob = new Date(row.DOB);
        if (isNaN(dob.getTime())) {
          throw new Error(`DOB format is wrong at row ${index + 1}`);
        }
        const isoDOB = dob.toISOString();
        // ----- End DOB Validation -----

        // Hash the password for the User record, ensuring it is a string
        const hashedPassword = await bcrypt.hash(String(row.password), 10);

        // Return an object that contains both user and student data, including departmentId.
        return {
          // Fields for the User table
          email: row.email,
          password: hashedPassword,
          // Fields for the Student table
          firstName: row.firstName,
          lastName: row.lastName,
          personalEmailId: row.personalEmailId,
          rollNo: row.rollNo,
          departmentName: row.departmentName, // Updated to match DB
          departmentId: departmentRecord.id,  // NEW: departmentId from lookup
          DOB: isoDOB,
          phoneNo: row.phoneNo,
          secondaryPhoneNo: row.secondaryPhoneNo,
          country: row.country,
          district: row.district,
          state: row.state,
          collegeId,
        };
      })
    );

    console.log("Processed student data example:", validData[0]);

    const result = await insertStudents(validData);
    return NextResponse.json(result, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error("❌ Error in POST /students:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
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
