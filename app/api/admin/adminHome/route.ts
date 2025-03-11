import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalColleges = await prisma.college.count();
    const approvedColleges = await prisma.college.count({ where: { status: "ACTIVE" } });
    const pendingApprovals = await prisma.college.count({ where: { status: "PENDING" } });

    return NextResponse.json({ totalColleges, approvedColleges, pendingApprovals }, { status: 200 });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
