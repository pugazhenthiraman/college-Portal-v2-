import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { hodAssignmentSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("HOD assignment request body:", body);
    
    // Validate and parse the input data using Zod
    const parsedData = hodAssignmentSchema.parse(body);
    const { collegeId, departmentId, hodName, hodEmail, password, contactNo, aadhaarNo } = parsedData;

    // Check if a HOD with the same Aadhaar or phone number already exists in the same college
    const existingHodAadhaar = await prisma.hOD.findFirst({
      where: {
        collegeId,
        adhaarNo: aadhaarNo,
      },
    });
    const existingHodPhone = await prisma.hOD.findFirst({
      where: {
        collegeId,
        phoneNo: contactNo,
      },
    });

    let errorMsg = "";
    if (existingHodAadhaar) {
      errorMsg += `A HOD with this Aadhaar number (${aadhaarNo}) already exists. `;
    }
    if (existingHodPhone) {
      errorMsg += `A HOD with this phone number (${contactNo}) already exists.`;
    }
    if (errorMsg) {
      return NextResponse.json({ error: errorMsg.trim() }, { status: 400 });
    }

    // Use upsert to create or update the user record for the HOD.
    // If a user with hodEmail already exists, update their role to "HOD".
    // Otherwise, create a new user with role "HOD".
    const user = await prisma.user.upsert({
      where: { email: hodEmail },
      update: { role: "HOD" },
      create: {
        email: hodEmail,
        password: await bcrypt.hash(password, 10), // hash the password
        role: "HOD",
      },
    });
    console.log("User upsert successful:", user);

    // Create the HOD record linked to the upserted user and specified department.
    const hod = await prisma.hOD.create({
      data: {
        userId: user.id,
        name: hodName,
        phoneNo: contactNo,
        adhaarNo: aadhaarNo,
        collegeId,
        departmentId,
      },
    });
    console.log("Assigned HOD:", hod);

    return NextResponse.json({ success: true, hod }, { status: 200 });
  } catch (error: any) {
    console.error("Error assigning HOD:", error);
    // Handle Zod validation errors
    if (error.errors) {
      const formattedErrors = error.errors.map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: formattedErrors }, { status: 400 });
    }
    // Handle known Prisma errors (e.g. unique constraint errors)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists. Please use a different email or update the existing record." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Error assigning HOD" }, { status: 500 });
  }
}
