import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Log the request URL for debugging
    console.log("API /hod/students GET called with URL:", req.url);

    // Get current session
    const session: any = await getServerSession(authOptions);
    if (!session?.user) {
      console.error("Unauthorized access: No session or user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure the user is a HOD
    if (session.user.role !== "HOD") {
      console.error("Access denied: User role is not HOD:", session.user.role);
      return NextResponse.json({ error: "Access denied: Not a HOD" }, { status: 403 });
    }

    // Retrieve HOD record based on userId
    const hodRecord = await prisma.hOD.findUnique({
      where: { userId: Number(session.user.id) },
      select: { departmentId: true, collegeId: true },
    });

    if (!hodRecord) {
      console.error("HOD record not found for user id:", session.user.id);
      return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
    }

    // Fetch students assigned to the HOD's department and college
    const students = await prisma.student.findMany({
      where: {
        collegeId: hodRecord.collegeId,
        departmentId: hodRecord.departmentId,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        // Remove facultyName as it does not exist in the Student model
                // facultyName: true, // Include facultyName instead of departmentName
        DOB: true,
        phoneNo: true,
        personalEmailId: true,
        user: { select: { email: true } }, // Include user email
      },
    });

    console.log(`Students fetched for HOD (userId: ${session.user.id}):`, students.length);
    console.log("Students data:", students); // Log the students data for debugging

    return NextResponse.json({ students }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching HOD's students:", error.message || error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}