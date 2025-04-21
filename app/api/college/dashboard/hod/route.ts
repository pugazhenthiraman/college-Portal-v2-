// File: app/api/college/dashboard/hod/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { assignmentSchema } from "@/lib/validation";
import { UserRole } from "@prisma/client";

// GET: Fetch HOD details (if needed)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeIdParam = searchParams.get("collegeId");
    console.log("GET Request received with collegeId:", collegeIdParam);

    if (!collegeIdParam) {
      return NextResponse.json(
        { error: "collegeId query parameter is required" },
        { status: 400 }
      );
    }
    const collegeId = Number(collegeIdParam);
    if (isNaN(collegeId)) {
      return NextResponse.json(
        { error: "collegeId must be a valid number" },
        { status: 400 }
      );
    }

    // Example: fetch HOD records for the college
    const hods = await prisma.hOD.findMany({
      where: { collegeId },
      include: { user: true },
    });
    console.log("HODs fetched:", hods);
    return NextResponse.json({ success: true, hods }, { status: 200 });
  } catch (error) {
    console.error("Error fetching HOD details:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching HOD details" },
      { status: 500 }
    );
  }
}

// POST: Create a new HOD record
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Assignment request body:", body);

    // Map incoming keys to expected schema keys
    const mappedBody = {
      ...body,
      name: body.hodName ?? body.name,
      email: body.hodEmail ?? body.email,
    };

    const parsedData = assignmentSchema.parse(mappedBody);
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

    // Create an update schema by extending assignmentSchema, making the password optional.
    const updateSchema = assignmentSchema.extend({
      password: assignmentSchema.shape.password.optional(),
    });
    // Validate and parse the input data using the update schema.
    const parsedData = updateSchema.parse(body);
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
    const updatedUserData: { role: UserRole; password?: string } = { role: "HOD" as UserRole };
    if (password) {
      updatedUserData.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { email },
      data: updatedUserData,
    });
    console.log("User update successful:", updatedUser);

    // Update the HOD record using userId as the identifier
    const updatedHod = await prisma.hOD.update({
      where: { userId: existingUser.id },
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
