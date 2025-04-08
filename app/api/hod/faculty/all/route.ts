// File: app/api/faculty-advisors/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    console.log("GET /api/faculty-advisors: Starting");

    const { searchParams } = new URL(req.url);
    const departmentIdParam = searchParams.get("departmentId");

    if (!departmentIdParam) {
      return NextResponse.json({ error: "Missing departmentId" }, { status: 400 });
    }

    const departmentId = Number(departmentIdParam);
    if (isNaN(departmentId)) {
      return NextResponse.json({ error: "Invalid departmentId" }, { status: 400 });
    }

    const facultyAdvisors = await prisma.faculty.findMany({
      where: {
        departmentId,
      },
      select: {
        id: true,
        name: true,
        contactNo: true,
        aadhaarNo: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    console.log(`Found ${facultyAdvisors.length} faculty advisors for departmentId ${departmentId}`);

    const response = facultyAdvisors.map((f) => ({
      id: f.id,
      name: f.name,
      email: f.user.email,
      contactNo: f.contactNo || "Not Provided",
      aadhaarNo: f.aadhaarNo || "Not Provided",
      createdAt: f.createdAt,
    }));

    return NextResponse.json({ facultyAdvisors: response });
  } catch (error: any) {
    console.error("Error fetching faculty advisors:", error);
    return NextResponse.json(
      { error: `Failed to fetch faculty advisors: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
