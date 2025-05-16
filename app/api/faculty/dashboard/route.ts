import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    studentCount: 120,
    facultyCount: 15,
    pendingTasks: 7,
  });
}