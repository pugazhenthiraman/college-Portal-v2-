import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // or use bcryptjs if preferred

export async function verifyCollegePassword(collegeId: number, password: string): Promise<boolean> {
  try {
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
      include: { user: true },
    });

    if (!college || !college.user) {
      console.log("College or user not found for collegeId:", collegeId);
      return false;
    }

    const trimmedPassword = password.trim();
    console.log("---------------------------");
    console.log("Entered password:", trimmedPassword);
    console.log("Stored hash:", college.user.password);

    const isMatch = await bcrypt.compare(trimmedPassword, college.user.password);

  

    console.log("Password match result:", isMatch); // true or false
    return isMatch;

  } catch (error) {
    console.error("Error in verifyCollegePassword:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collegeId, departmentId, action, password } = body;


    console.log("Request body:", body);

    // Validate inputs
    if (
      typeof collegeId !== "number" ||
      typeof departmentId !== "number" ||
      (action !== "all" && action !== "hod") ||
      typeof password !== "string" ||
      password.trim() === ""
    ) {
      console.log("Invalid request body:", body);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Verify the college's credential password using bcrypt
    const isVerified = await verifyCollegePassword(collegeId, password);
    if (!isVerified) {
      console.log("Password verification failed for collegeId:", collegeId);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (action === "all") {
      // Remove the entire department (assuming cascading delete is configured in your Prisma schema)
      const deletedDept = await prisma.department.delete({
        where: { id: departmentId },
      });
      console.log("Deleted department:", deletedDept);
      return NextResponse.json({ success: true, deletedDepartment: deletedDept }, { status: 200 });
    } else if (action === "hod") {
      // Remove only the HOD for the specified department.
      const hodRecord = await prisma.hOD.findUnique({
        where: { departmentId },
      });
      if (!hodRecord) {
        console.log("No HOD found for departmentId:", departmentId);
        return NextResponse.json({ error: "No HOD found for this department" }, { status: 404 });
      }
      const deletedHod = await prisma.hOD.delete({
        where: { departmentId },
      });
      console.log("Deleted HOD:", deletedHod);
      return NextResponse.json({ success: true, deletedHod }, { status: 200 });
    }

    console.log("Invalid action provided:", action);
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error removing department data:", error);
    return NextResponse.json({ error: "An error occurred while removing data" }, { status: 500 });
  }
}