import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Fetch departments for a given collegeId (including HOD data with user email)
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

    // Include the HOD relation and its related user data so that the HOD's email is available
    const departments = await prisma.department.findMany({
      where: { collegeId },
      include: { hod: { include: { user: true } } },
    });
    console.log("Departments fetched:", departments);

    return NextResponse.json(
      { success: true, departments },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching departments" },
      { status: 500 }
    );
  }
}

// OPTIONS: CORS headers
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

// POST: Save departments for a given collegeId
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("POST Request received with body:", body);

    const { collegeId, departments } = body;

    // Validate collegeId
    if (typeof collegeId !== "number") {
      console.error("Invalid collegeId:", collegeId);
      return NextResponse.json(
        { error: "Invalid collegeId" },
        { status: 400 }
      );
    }

    // Check if the college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });
    if (!college) {
      console.error("College not found for collegeId:", collegeId);
      return NextResponse.json(
        { error: "College not found" },
        { status: 404 }
      );
    }

    // Validate departments array
    if (!Array.isArray(departments) || departments.length === 0) {
      console.error("Invalid departments array:", departments);
      return NextResponse.json(
        { error: "Invalid departments array" },
        { status: 400 }
      );
    }

    // Filter and trim department names; remove empty strings
    const validDepartments = departments
      .filter((dept: any) => typeof dept === "string")
      .map((dept: string) => dept.trim())
      .filter((dept: string) => dept !== "");

    if (validDepartments.length === 0) {
      console.error("No valid department names provided:", departments);
      return NextResponse.json(
        { error: "No valid department names provided" },
        { status: 400 }
      );
    }

    // Process each department: if it exists, return it; if not, create it.
    const savedDepartments = await Promise.all(
      validDepartments.map(async (deptName: string) => {
        let dept = await prisma.department.findFirst({
          where: { collegeId, name: deptName },
        });
        if (!dept) {
          dept = await prisma.department.create({
            data: {
              name: deptName,
              college: { connect: { id: collegeId } },
            },
          });
        }
        return dept;
      })
    );

    console.log("Departments saved:", savedDepartments);

    return NextResponse.json(
      { success: true, departments: savedDepartments },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving departments:", error.message, error.stack, error);
    return NextResponse.json(
      { error: "An error occurred while saving departments" },
      { status: 500 }
    );
  }
}
