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
    select: { userId: true, sections: true },
  });

  const assignments: Record<number, string[]> = {};
  for (const f of facultyList) {
    assignments[f.userId] = f.sections;
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
          where: { userId },
          select: { id: true, hodId: true, sections: true },
        });
        if (!fac || fac.hodId !== hod.id) {
          throw new Error(`Faculty (user #${userId}) isn’t under your supervision`);
        }

        // 1) Remove students from sections that are no longer assigned to this faculty
        const previousSections: string[] = fac.sections ?? [];
        const sectionsToRemove = previousSections.filter(s => !sections.includes(s));
        if (sectionsToRemove.length > 0) {
          await tx.student.updateMany({
            where: {
              facultyId: fac.id,
              section: { in: sectionsToRemove },
              hodId: hod.id,
              departmentId: hod.departmentId,
            },
            data: { facultyId: null },
          });
        }

        // 2) Assign students in the new sections to this faculty (only those not already assigned)
        for (const sec of sections) {
          await tx.student.updateMany({
            where: {
              section: sec,
              hodId: hod.id,
              departmentId: hod.departmentId,
              facultyId: null, // Only assign unassigned students
            },
            data: { facultyId: fac.id },
          });
        }

        // 3) Recalculate and persist the sections array for this faculty
        const students = await tx.student.findMany({
          where: { facultyId: fac.id, hodId: hod.id, departmentId: hod.departmentId },
          select: { section: true },
        });
        const uniqueSections = Array.from(
          new Set(students.map(s => s.section).filter((section): section is string => !!section))
        );
        await tx.faculty.update({
          where: { userId },
          data: { sections: uniqueSections },
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