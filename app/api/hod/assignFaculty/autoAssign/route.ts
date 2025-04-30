// File: app/api/hod/assignFaculty/autoAssign/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

type Assignment = { userId: number; sections: string[] };

export async function GET() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hod = await prisma.hOD.findUnique({
    where: { userId: Number(session.user.id) },
    select: { id: true, departmentId: true },
  });
  if (!hod) {
    return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
  }

  // load each faculty’s saved sections
  const facultyList = await prisma.faculty.findMany({
    where: { hodId: hod.id, departmentId: hod.departmentId },
    select: { userId: true, section: true },
  });

  const assignments: Record<number, string[]> = {};
  for (const f of facultyList) {
    assignments[f.userId] = f.section;
  }

  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Assignment[];
  try {
    payload = await req.json();
    if (!Array.isArray(payload)) throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  const hod = await prisma.hOD.findUnique({
    where: { userId: Number(session.user.id) },
    select: { id: true, departmentId: true },
  });
  if (!hod) {
    return NextResponse.json({ error: "HOD record not found" }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const { userId, sections } of payload) {
        const fac = await tx.faculty.findUnique({
          where:  { userId },
          select: { id: true, hodId: true },
        });
        if (!fac || fac.hodId !== hod.id) {
          throw new Error(`Faculty (user #${userId}) isn’t under your supervision`);
        }

        // 1) clear any existing student links
        await tx.student.updateMany({
          where: {
            facultyId:    fac.id,
            hodId:        hod.id,
            departmentId: hod.departmentId,
          },
          data: { facultyId: null },
        });

        // 2) assign each selected section
        for (const sec of sections) {
          await tx.student.updateMany({
            where: {
              section:      sec,
              hodId:        hod.id,
              departmentId: hod.departmentId,
            },
            data: { facultyId: fac.id },
          });
        }

        // 3) persist the **array** back to faculty
        await tx.faculty.update({
          where: { userId },
          data: { section: sections },
        });
      }
    });

    return NextResponse.json({ message: "Assignments saved successfully." });
  } catch (err: any) {
    console.error("Auto‐assign error:", err);
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Constraint violation—please verify your data." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err.message || "Unexpected error" },
      { status: 400 }
    );
  }
}
