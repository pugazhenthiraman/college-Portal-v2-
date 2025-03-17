// import { NextRequest, NextResponse } from "next/server";
// import * as XLSX from "xlsx";
// import bcrypt from "bcrypt";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { insertStudents } from "@/utils/helper";
// import  prisma  from "@/lib/prisma";

// // Required columns for validation
// const REQUIRED_COLUMNS = [
//   "name", "email", "password", "departmentName", "rollNo",
//   "personalEmail", "DOB", "phoneNo", "nationality", "countryCode", "departmentName"
// ];

// export async function POST(req: NextRequest) {
//   try {
//     // 🔥 Fetch session & user details from NextAuth
//     const session : any = await getServerSession(authOptions);
//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
//     }

//     // Extract `collegeId` from user session
//     const userId = session.user.id;
//     const user = await prisma.user.findUnique({
//       where: { id: Number(userId) },
//       include: { college: true }, // Ensure college details are fetched
//     });

//     if (!user || !user.college) {
//       return NextResponse.json({ error: "Unauthorized: College ID not found" }, { status: 401 });
//     }
//     const collegeId = user.college.id; // Extract `collegeId`

//     // Parse formData
//     const formData = await req.formData();
//     const file = formData.get("studentsExcelData") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     // ✅ Read the file directly in memory (NO SAVING)
//     const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const jsonData = XLSX.utils.sheet_to_json(worksheet);

//     // Validate headers
//     const fileColumns = Object.keys(jsonData[0] || {});
//     const missingColumns = REQUIRED_COLUMNS.filter(col => !fileColumns.includes(col));
//     if (missingColumns.length > 0) {
//       return NextResponse.json({ error: `Missing columns: ${missingColumns.join(", ")}` }, { status: 400 });
//     }

//     // Validate and Hash Passwords
//     const validData = await Promise.all(
//       jsonData.map(async (row : any, index) => {
//         if (!row.name || !row.email || !row.password) {
//           throw new Error(`Row ${index + 1} has missing values`);
//         }
//         if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(row.email)) {
//           throw new Error(`Row ${index + 1}: Invalid email format`);
//         }

//         // Hash password before storing
//         const hashedPassword = await bcrypt.hash(row.password, 10);
//         return { ...row, hashedPassword, collegeId }; // ✅ Inject `collegeId`
//       })
//     );

//     // Insert data efficiently in batches
//     const batchSize = 500;
//     for (let i = 0; i < validData.length; i += batchSize) {
//       const batch = validData.slice(i, i + batchSize);
//       await insertStudents(batch);
//     }

//     return NextResponse.json({ message: "Students inserted successfully" }, { status: 200 });

//   } catch (error : any) {
//     console.log("error: ", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// export const config = {
//   api: {
//     bodyParser: false, // Required for handling file uploads
//   },
// };


import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { insertStudents } from "@/utils/helper";
import prisma from "@/lib/prisma";

// Required columns for validation
const REQUIRED_COLUMNS = [
  "name", "email", "password", "departmentId", "rollNo",
  "personalEmail", "DOB", "phoneNo", "nationality", "countryCode", "departmentName"
];

export async function POST(req: NextRequest) {
  try {
    // 🔥 Fetch session & user details from NextAuth
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    // Extract `collegeId` from user session
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { college: true }, // Ensure college details are fetched
    });

    if (!user || !user.college) {
      return NextResponse.json({ error: "Unauthorized: College ID not found" }, { status: 401 });
    }
    const collegeId = user.college.id; // Extract `collegeId`

    // Parse formData
    const formData = await req.formData();
    const file = formData.get("studentsExcelData") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ✅ Read the file directly in memory (NO SAVING)
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log("Parsed JSON Data:", jsonData); // Debug log

    // Validate headers
    const fileColumns = Object.keys(jsonData[0] || {});
    const missingColumns = REQUIRED_COLUMNS.filter(col => !fileColumns.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json({ error: `Missing columns: ${missingColumns.join(", ")}` }, { status: 400 });
    }

    // Validate and Hash Passwords
    const validData = await Promise.all(
      jsonData.map(async (row: any, index) => {
        if (!row.name || !row.email || !row.password) {
          console.log(`❌ Row ${index + 1} is missing required fields`, row);
          throw new Error(`Row ${index + 1} has missing values`);
        }

        console.log(`✅ Row ${index + 1} received departmentId:`, row.departmentId); // Debug Log

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(row.password, 10);

        return { 
          ...row, 
          password: hashedPassword, 
          collegeId, 
          departmentId: Number(row.departmentId) || null  // Ensure it's a valid number
        };
      })
    );

    console.log("Valid Data to Insert:", validData); // Debug log

    // Insert data efficiently in batches
    const batchSize = 500;
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);
      await insertStudents(batch);
    }

    return NextResponse.json({ message: "Students inserted successfully" }, { status: 200 });
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 🔥 Fetch session & user details from NextAuth
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    // Extract `collegeId` from user session
    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { college: true },
    });

    if (!user || !user.college) {
      return NextResponse.json({ error: "Unauthorized: College ID not found" }, { status: 401 });
    }
    const collegeId = user.college.id;

    // ✅ Fetch students for the respective college & include `email` & `password` from `User`
    const students = await prisma.student.findMany({
      where: { collegeId: collegeId },
      include: {
        user: {
          select: {
            email: true,
            password: true
          }
        }
      }
    });

    console.log("Fetched Students Data:", JSON.stringify(students, null, 2)); // Debug log

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for handling file uploads
  },
};
