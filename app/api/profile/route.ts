// File: app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const role = session.user.role as string;

  // everyone has these
  const base = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, createdAt: true },
  });
  if (!base) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let extra: Record<string, any> = {};

  switch (role) {
    case "SUPER_ADMIN":
      // we just confirm existence
      await prisma.superAdmin.findUnique({
        where: { userId },
        select: { id: true },
      });
      break;

    case "COLLEGE":
      extra = await prisma.college.findUnique({
        where: { userId },
        select: { name: true, collegeType: true, status: true },
      }) || {};
      break;

    case "HOD":
      const hod = await prisma.hOD.findUnique({
        where: { userId },
        select: {
          name: true,
          phoneNo: true,
          adhaarNo: true,
          college: { select: { name: true } },
          department: { select: { name: true } },
        },
      });
      if (hod) {
        extra = {
          name: hod.name,
          phoneNo: hod.phoneNo,
          adhaarNo: hod.adhaarNo,
          collegeName: hod.college.name,
          departmentName: hod.department.name,
        };
      }
      break;

    case "FACULTY":
      const fac = await prisma.faculty.findUnique({
        where: { userId },
        select: {
          name: true,
          contactNo: true,
          aadhaarNo: true,
          college: { select: { name: true } },
          department: { select: { name: true } },
        },
      });
      if (fac) {
        extra = {
          name: fac.name,
          contactNo: fac.contactNo,
          aadhaarNo: fac.aadhaarNo,
          collegeName: fac.college.name,
          departmentName: fac.department.name,
        };
      }
      break;

    case "STUDENT":
      const stu = await prisma.student.findUnique({
        where: { userId },
        select: {
          firstName: true,
          lastName: true,
          personalEmailId: true,
          phoneNo: true,
          rollNo: true,
          DOB: true,
          college: { select: { name: true } },
          department: { select: { name: true } },
        },
      });
      if (stu) {
        extra = {
          name: `${stu.firstName} ${stu.lastName}`,
          personalEmailId: stu.personalEmailId,
          phoneNo: stu.phoneNo,
          rollNo: stu.rollNo,
          DOB: stu.DOB,
          collegeName: stu.college.name,
          departmentName: stu.department.name,
        };
      }
      break;

    default:
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  return NextResponse.json({
    id: base.id,
    email: base.email,
    role,
    createdAt: base.createdAt,
    ...extra,
  });
}
