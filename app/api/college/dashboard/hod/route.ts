import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { assignmentSchema } from "@/lib/validation";

// POST: Create a new HOD record
export async function POST(req: Request) {
  try {
    // Parse and log the incoming request body
    const body = await req.json();
    console.log("Assignment request body:", body);

    // Validate and parse the input data using the generic assignment schema
    const parsedData = assignmentSchema.parse(body);
    const { collegeId, departmentId, name, email, password, contactNo, aadhaarNo } = parsedData;
    console.log("Parsed Data:", { collegeId, departmentId, name, email, contactNo, aadhaarNo });

    // Check for duplicate HOD records based on Aadhaar and phone number within the same college
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

    return NextResponse.json({ success: true, hod }, { status: 200 });
  } catch (error: any) {
    console.error("Error assigning HOD:", error);

    // Handle Zod validation errors
    if (error.errors) {
      const formattedErrors = error.errors.map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: `Validation Error: ${formattedErrors}` }, { status: 400 });
    }

    // Handle Prisma unique constraint errors (e.g., duplicate email)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists. Please use a different email or update the existing record." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `HOD creation failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    console.log("POST request to /api/college/dashboard/hod completed.");
  }
}

// PUT: Update (edit) an existing HOD record
export async function PUT(req: Request) {
  try {
    // Parse and log the incoming request body
    const body = await req.json();
    console.log("Edit HOD request body:", body);

    // Validate and parse the input data using the same assignment schema
    const parsedData = assignmentSchema.parse(body);
    const { collegeId, departmentId, name, email, password, contactNo, aadhaarNo } = parsedData;
    console.log("Parsed data for update:", { collegeId, departmentId, name, email, contactNo, aadhaarNo });

    // Find the existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return NextResponse.json({ error: "HOD record not found for the provided email" }, { status: 404 });
    }

    // Prepare the update data for the user; if password is provided, hash it.
    let updatedUserData: { role: string; password?: string } = { role: "HOD" };
    if (password) {
      updatedUserData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updatedUserData,
    });
    console.log("User update successful:", updatedUser);

    // Update the HOD record linked to the user.
    // (Assuming departmentId is unique for a HOD record; if not, you may use userId)
    const updatedHod = await prisma.hOD.update({
      where: { departmentId },
      data: {
        name,
        phoneNo: contactNo,
        adhaarNo: aadhaarNo,
        collegeId,
        departmentId,
      },
    });
    console.log("Updated HOD:", updatedHod);

    return NextResponse.json({ success: true, hod: updatedHod }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating HOD:", error);
    if (error.errors) {
      const formattedErrors = error.errors.map((err: any) => err.message).join(", ");
      return NextResponse.json({ error: `Validation Error: ${formattedErrors}` }, { status: 400 });
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists. Please use a different email or update the existing record." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: `Error updating HOD: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    console.log("PUT request to /api/college/dashboard/hod completed.");
  }
}
