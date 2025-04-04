// app/api/hod/faculty/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Replace with actual logic to fetch faculty data
  const faculties = [
    { id: 1, name: "Dr. John Doe", email: "john@example.com" },
    { id: 2, name: "Dr. Jane Smith", email: "jane@example.com" },
  ];
  return NextResponse.json({ faculties });
}
