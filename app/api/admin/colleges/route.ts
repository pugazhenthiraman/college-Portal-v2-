import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, CollegeStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth"
const prisma = new PrismaClient();



export async function GET(req: NextRequest) {
  try {
    // ✅ Get session using NextAuth
    const session : any = await getServerSession(authOptions);

    // ✅ Ensure user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ensure only SUPER_ADMIN can access
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ✅ Get query parameters
    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status")?.toUpperCase();
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // ✅ Validate and convert status to Prisma Enum (CollegeStatus)
    let statusFilter = {};
    if (statusParam && Object.values(CollegeStatus).includes(statusParam as CollegeStatus)) {
      statusFilter = { status: statusParam as CollegeStatus };
    }

    // ✅ Get total count for pagination
    const totalColleges = await prisma.college.count({ where: statusFilter });

    // ✅ Fetch paginated colleges using the new schema structure
    const colleges = await prisma.college.findMany({
      where: statusFilter,
      select: {
        id: true,
        name: true,
        user: { select: { email: true } }, // ✅ Fetch email from User table
        status: true,
        remark: true,
        affiliatedUniversity: true,
        deemedUniversity: true,
        recognitionStatus: true,
        instituteCode: true,
        councilIssuingCode: true,
        createdAt: true,
      },
      skip: (page - 1) * limit, // ✅ Skip records based on pagination
      take: limit, // ✅ Limit records per page
      orderBy: { createdAt: "desc" }, // ✅ Sort by latest first
    });

    return NextResponse.json({
      colleges,
      page,
      limit,
      totalPages: Math.ceil(totalColleges / limit),
      totalColleges,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
