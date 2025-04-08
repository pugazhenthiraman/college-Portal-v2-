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

export async function GET() {
  try {
    console.log("GET /api/hod/details: Starting request");

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      console.log("Unauthorized: No valid session or user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    console.log("Resolved userId:", userId);

    const hod = await prisma.hOD.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true } },
        college: {
          select: {
            id: true,
            name: true,
            collegeType: true,
            affiliatedUniversity: true,
            status: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!hod) {
      console.log("HOD not found for userId:", userId);
      return NextResponse.json({ error: "HOD not found" }, { status: 404 });
    }

    console.log("Fetched HOD data:", hod);

    return NextResponse.json({
      id: hod.id,
      name: hod.name,
      email: hod.user.email,
      phoneNo: hod.phoneNo,
      adhaarNo: hod.adhaarNo,
      college: hod.college,
      department: hod.department,
      createdAt: hod.createdAt,
    });
  } catch (error: any) {
    console.error("Error in GET /api/hod/details:", error);
    return NextResponse.json(
      { error: `Failed to fetch HOD details: ${error.message || "Unknown error"}` },
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
