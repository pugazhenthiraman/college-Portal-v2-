import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Validation schema: ensures that collegeId and departmentId are provided along with faculty data.
const assignmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  contactNo: z.string().min(10, "Contact number must be at least 10 digits"),
  aadhaarNo: z
    .string()
    .min(10, "Aadhaar number must be at least 10 digits")
    .max(12, "Aadhaar number must be at most 12 digits"),
  collegeId: z.number().int("College ID is required"),
  departmentId: z.number().int("Department ID is required"),
});

// GET: Fetch HOD context and all faculty records (with nested user email)
export async function GET() {
  try {
    // Log: Starting GET
    console.log("GET /api/hod/faculty: Starting request");

    const session = await getServerSession(authOptions);
    console.log("Session received:", session);

    if (!session) {
      console.log("Unauthorized: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user) {
      console.log("Unauthorized: User information is missing in the session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = Number(session.user?.email?.split('@')[0]); // Example: Extracting userId from email prefix
    console.log("Fetched userId from session:", userId);

    const hod = await prisma.hOD.findUnique({
      where: { userId },
      select: {
        collegeId: true,
        departmentId: true,
      },
    });
    console.log("HOD record:", hod);

    if (!hod) {
      console.log("HOD not found for userId:", userId);
      return NextResponse.json({ error: "HOD not found" }, { status: 404 });
    }

    const faculty = await prisma.faculty.findMany({
      where: {
        collegeId: hod.collegeId,
        departmentId: hod.departmentId,
      },
      select: {
        id: true,
        name: true,
        contactNo: true,
        aadhaarNo: true,
        user: { select: { email: true } },
      },
    });
    console.log("Fetched faculty records:", faculty);

    const transformedFaculty = faculty.map(f => ({
      id: f.id,
      name: f.name,
      email: f.user.email,
      contactNo: f.contactNo || "Not Provided",
      aadhaarNo: f.aadhaarNo || "Not Provided",
    }));
    console.log("Transformed faculty data:", transformedFaculty);

    console.log("GET /api/hod/faculty: Successfully returning data");
    return NextResponse.json({
      collegeId: hod.collegeId,
      departmentId: hod.departmentId,
      faculty: transformedFaculty,
    });
  } catch (error: any) {
    console.error("Error in GET /api/hod/faculty:", error);
    return NextResponse.json(
      { error: `Failed to fetch data: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}

// POST: Create a new Faculty Advisor record
export async function POST(req: Request) {
  try {
    console.log("POST /api/hod/faculty: Request received.");

    const body = await req.json();
    console.log("Incoming request body:", body);

    if (!body.collegeId || !body.departmentId) {
      console.error("Missing collegeId or departmentId in the request body.");
      return NextResponse.json(
        { error: "Validation Error: College ID and Department ID are required." },
        { status: 400 }
      );
    }

    // Parse and validate request body using Zod schema.
    const parsedData = assignmentSchema.parse(body);
    const { collegeId, departmentId, name, email, password, contactNo, aadhaarNo } = parsedData;
    console.log("Parsed and validated data:", { collegeId, departmentId, name, email, contactNo, aadhaarNo });

    // Upsert the user record (to avoid duplicate emails)
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

    // Create the Faculty record with the related user.
    const faculty = await prisma.faculty.create({
      data: {
        userId: user.id,
        name,
        collegeId,
        departmentId,
        contactNo,
        aadhaarNo,
      },
    });
    console.log("Faculty record created successfully:", faculty);

    console.log("POST /api/hod/faculty: Completed successfully.");
    return NextResponse.json({ success: true, faculty }, { status: 200 });
  } catch (error: any) {
    console.error("Error in POST /api/hod/faculty:", error);

    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map((err) => err.message).join(", ");
      return NextResponse.json({ error: `Validation Error: ${formattedErrors}` }, { status: 400 });
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A user with this email already exists. Please use a different email or update the existing record." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Faculty Advisor creation failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  } finally {
    console.log("POST /api/hod/faculty: Request processing finished.");
  }
}
