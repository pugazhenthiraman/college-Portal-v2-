import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { assignmentSchema } from "@/lib/validation";

// GET: Fetch all faculty records (with related user, college, and department data)
export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        user: true,      // Include user data (e.g., email)
        college: true,   // Include college data
        department: true // Include department data
      },
    });

    // Sanitize data: replace null values with default placeholders for contactNo and aadhaarNo
    const sanitizedFaculty = faculty.map((f) => ({
      ...f,
      contactNo: f.contactNo || "Not Provided",
      aadhaarNo: f.aadhaarNo || "Not Provided",
    }));

    console.log("Fetched and sanitized faculty data:", sanitizedFaculty);

    return NextResponse.json({ success: true, faculty: sanitizedFaculty }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching faculty data:", error);
    return NextResponse.json(
      { error: `Failed to fetch faculty data: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

// POST: Create a new Faculty Advisor record after validating input data
export async function POST(req: Request) {
  try {
    // Parse and log the incoming request body
    const body = await req.json();
    console.log("Faculty assignment request body:", body);

    // Validate the request body using the assignment schema
    const parsedData = assignmentSchema.parse(body);
    const { collegeId, departmentId, name, email, password, contactNo, aadhaarNo } = parsedData;
    console.log("Parsed data:", { collegeId, departmentId, name, email, contactNo, aadhaarNo });

    // Upsert the user record with role "FACULTY"
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "FACULTY" },
      create: {
        email,
        password: await bcrypt.hash(password, 10),
        role: "FACULTY",
      },
    });
    console.log("User upsert successful:", user);

    // Create the Faculty record using the provided details
    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        name,
        collegeId,     // Directly supply the collegeId
        departmentId,  // Directly supply the departmentId
        contactNo,     // Save the contact number
        aadhaarNo,     // Save the Aadhaar number
      },
    });
    console.log("Assigned Faculty Advisor:", faculty);

    return NextResponse.json({ success: true, faculty }, { status: 200 });
  } catch (error: any) {
    console.error("Error assigning Faculty Advisor:", error);

    // Check for Zod validation errors and format them
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

    // Return a general error message for any other errors
    return NextResponse.json(
      { error: `Faculty Advisor creation failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    console.log("POST request to /api/hod/faculty completed.");
  }
}
