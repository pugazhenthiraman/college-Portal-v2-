import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Import NextAuth config
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  try {
    // ✅ Fetch session using NextAuth
    const session : any  = await getServerSession(authOptions);

    // ✅ Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 });
    }

    // ✅ Only allow SUPER_ADMIN to approve/reject colleges
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ Get request body
    const { collegeId, status, remark } = await req.json();

    // ✅ Validate request data
    if (!collegeId || !["ACTIVE", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // ✅ Check if the college exists
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // ✅ Prevent re-approval (if already ACTIVE, it can't be set to ACTIVE again)
    if (college.status === "ACTIVE" && status === "ACTIVE") {
      return NextResponse.json({ error: "College is already ACTIVE" }, { status: 400 });
    }

    // ✅ Allow rejecting colleges regardless of their current status (PENDING or ACTIVE)
    if (status === "REJECTED") {
      const updatedCollege = await prisma.college.update({
        where: { id: collegeId },
        data: { status, remark },
      });

      return NextResponse.json(
        { message: "College rejected successfully", college: updatedCollege },
        { status: 200 }
      );
    }

    // ✅ Approve the college if it was pending
    const updatedCollege = await prisma.college.update({
      where: { id: collegeId },
      data: { status, remark },
    });

    return NextResponse.json(
      { message: `College ${status.toLowerCase()} successfully`, college: updatedCollege },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving/rejecting college:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
