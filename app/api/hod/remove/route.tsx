import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper function: Verify the HOD's password for the given department
export async function verifyHodPassword(departmentId: number, password: string): Promise<boolean> {
  try {
    // Find the HOD record by departmentId and include the associated user
    const hod = await prisma.hOD.findUnique({
      where: { departmentId },
      include: { user: true },
    });

    if (!hod || !hod.user) {
      console.log("No HOD found for department:", departmentId);
      return false;
    }

    const trimmedPassword = password.trim();
    console.log("Entered HOD password:", trimmedPassword);
    console.log("Stored HOD hash:", hod.user.password);

    const isMatch = await bcrypt.compare(trimmedPassword, hod.user.password);
    console.log("HOD password match result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error verifying HOD password:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Faculty removal request body:", body);
    const { departmentId, action, password } = body;

    // Validate inputs: here action must be "faculty"
    if (
      typeof departmentId !== "number" ||
      action !== "faculty" ||
      typeof password !== "string" ||
      password.trim() === ""
    ) {
      console.log("Invalid request body:", body);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Verify the HOD's credential for the department
    const isVerified = await verifyHodPassword(departmentId, password);
    if (!isVerified) {
      console.log("HOD password verification failed for department:", departmentId);
      return NextResponse.json({ error: "Invalid HOD credentials" }, { status: 401 });
    }

    // Remove only the Faculty Advisor for the specified department.
    const facultyRecord = await prisma.faculty.findFirst({
      where: { departmentId },
    });
    if (!facultyRecord) {
      console.log("No Faculty Advisor found for departmentId:", departmentId);
      return NextResponse.json({ error: "No Faculty Advisor found for this department" }, { status: 404 });
    }

    const deletedFaculty = await prisma.faculty.delete({
      where: { id: facultyRecord.id },
    });
    console.log("Deleted Faculty Advisor details:", deletedFaculty);

    return NextResponse.json(
      { success: true, message: "Faculty Advisor removed successfully", deletedFaculty },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error removing faculty advisor:", error);
    return NextResponse.json({ error: error.message || "An error occurred while removing faculty advisor" }, { status: 500 });
  }
}
