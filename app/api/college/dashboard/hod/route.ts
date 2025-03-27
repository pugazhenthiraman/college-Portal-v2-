// app/api/dashboard/hod/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collegeId, departmentId, hodName, hodEmail, password, contactNo, aadhaarNo } = body;

    if (
      !collegeId ||
      !departmentId ||
      !hodName ||
      !hodEmail ||
      !password ||
      !contactNo ||
      !aadhaarNo
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Create a new user for the HOD. In production, hash the password.
    const user = await prisma.user.create({
      data: {
        email: hodEmail,
        password: password,
        role: "HOD",
      },
    });

    // Create the HOD record and link it to the department and college.
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

    return NextResponse.json({ success: true, hod }, { status: 200 });
  } catch (error) {
    console.error("Error assigning HOD:", error);
    return NextResponse.json({ error: "Error assigning HOD" }, { status: 500 });
  }
}
