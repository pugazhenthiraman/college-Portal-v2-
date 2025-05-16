// app/api/students/studentsMultiStepForm/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

// Only these top-level Student fields may be updated via `section`
const ALLOWED_SECTIONS = [
  "general",
  "scholarship",
  "technicalSkills",
  "internships",
  "events",
  "socialProfiles",
  "placements",
  "workExperience",
  "publications",
] as const;
type Section = typeof ALLOWED_SECTIONS[number];

/**
 * POST /api/students/studentsMultiStepForm
 * Body: { section: Section, data: any }
 * Saves or updates a single “section” of the current student’s record.
 */
export async function POST(req: NextRequest) {
  // 1️⃣ Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: please sign in." },
      { status: 401 }
    );
  }

  // 2️⃣ Parse & validate JSON
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const { section, data } = body as { section?: string; data?: unknown };

  if (
    typeof section !== "string" ||
    !ALLOWED_SECTIONS.includes(section as Section)
  ) {
    return NextResponse.json(
      { error: `Invalid section: "${String(section)}".` },
      { status: 400 }
    );
  }

  // 3️⃣ Build Prisma update payload
  const updatePayload = { [section]: data } as Prisma.StudentUpdateInput;

  // 4️⃣ Execute update
  try {
    const updatedStudent = await prisma.student.update({
      where: { userId: Number(session.user.id) },
      data: updatePayload,
    });
    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (err) {
    console.error(`Error saving section "${section}":`, err);
    return NextResponse.json(
      { error: "Failed to save data. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/students/studentsMultiStepForm
 * Fetches the full student record (including college & department).
 */
export async function GET(req: NextRequest) {
  // 1️⃣ Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: please sign in." },
      { status: 401 }
    );
  }

  // 2️⃣ Fetch from DB
  try {
    const student = await prisma.student.findUnique({
      where: { userId: Number(session.user.id) },
      include: {
        college: true,
        department: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (err) {
    console.error("Error fetching student record:", err);
    return NextResponse.json(
      { error: "Failed to load data. Please try again later." },
      { status: 500 }
    );
  }
}
