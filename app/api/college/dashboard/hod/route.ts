import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { assignmentSchema } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    // Parse and log the incoming request body
    const body = await req.json();
    console.log("Assignment request body:", body);

    // Validate and parse the input data using the generic assignment schema
    const parsedData = assignmentSchema.parse(body);
    const { collegeId, departmentId, name, email, password, contactNo, aadhaarNo } = parsedData;
    console.log("Parsed Data:", { collegeId, departmentId, name, email, contactNo, aadhaarNo });

    // Check for duplicate records based on Aadhaar and phone number within the same college
    const existingRecordAadhaar = await prisma.hOD.findFirst({
      where: { collegeId, adhaarNo: aadhaarNo },
    });
    const existingRecordPhone = await prisma.hOD.findFirst({
      where: { collegeId, phoneNo: contactNo },
    });

    let errorMsg = "";
    if (existingRecordAadhaar) {
      errorMsg += `A HOD record with Aadhaar number ${aadhaarNo} already exists. `;
    }
    if (existingRecordPhone) {
      errorMsg += `A HOD record with phone number ${contactNo} already exists.`;
    }
    if (errorMsg) {
      console.error("Validation errors:", errorMsg.trim());
      return NextResponse.json({ error: errorMsg.trim() }, { status: 400 });
    }

    // Upsert the user record with role "HOD"
    // If a user with the provided email exists, update their role; otherwise, create a new one.
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "HOD" },
      create: {
        email,
        password: await bcrypt.hash(password, 10),
        role: "HOD",
      },
    });
    console.log("User upsert successful:", user);

    // Create the HOD record linked to the user and the specified department
    const hod = await prisma.hOD.create({
      data: {
        userId: user.id,
        name,
        phoneNo: contactNo,
        adhaarNo: aadhaarNo,
        collegeId,
        departmentId,
      },
    });
    console.log("Assigned HOD:", hod);

    // Return a successful JSON response with the created HOD record
    return NextResponse.json({ success: true, hod }, { status: 200 });
  } catch (error: any) {
    console.error("Error assigning HOD:", error);

    // If Zod validation errors are present, format and return them.
    if (error.errors) {
      const formattedErrors = error.errors.map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: `Validation Error: ${formattedErrors}` }, { status: 400 });
    }

    // Handle Prisma unique constraint errors (e.g. duplicate email)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists. Please use a different email or update the existing record." },
        { status: 409 }
      );
    }

    // Return a general error message for any other errors.
    return NextResponse.json(
      { error: `Faculty Advisor creation failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
