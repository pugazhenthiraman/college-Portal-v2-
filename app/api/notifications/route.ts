import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notifications?type=incoming|outgoing&unread=true|false
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // incoming|outgoing
  const unread = searchParams.get("unread");
  const studentId = searchParams.get("studentId");
  const where: any = {};
  if (studentId) {
    where.relatedStudentId = Number(studentId);
  } else if (type === "incoming") {
    where.receiverId = user.id;
  } else if (type === "outgoing") {
    where.senderId = user.id;
  } else {
    where.OR = [{ receiverId: user.id }, { senderId: user.id }];
  }
  if (unread === "true") where.read = false;
  if (unread === "false") where.read = true;
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      message: true,
      senderId: true,
      receiverId: true,
      relatedStudentId: true,
      createdAt: true,
      read: true,
      remarks: true,
      sender: { select: { id: true, email: true, role: true } },
      receiver: { select: { id: true, email: true, role: true } },
      relatedStudent: { select: { id: true, userId: true, firstName: true, lastName: true, departmentName: true, section: true, academicYear: true, rollNo: true } },
    },
  });

  // If fetching for a specific student, return full history (no grouping)
  if (studentId) {
    return NextResponse.json({ notifications });
  }
  // Otherwise, group by relatedStudentId + status, keep only the latest
  const uniqueMap = new Map();
  for (const n of notifications) {
    const key = `${n.relatedStudentId || "none"}-${n.status}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, n);
    }
  }
  const uniqueNotifications = Array.from(uniqueMap.values());
  return NextResponse.json({ notifications: uniqueNotifications });
}

// POST /api/notifications
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const body = await req.json();
  const { type, status, message, receiverId, relatedStudentId, remarks } = body;
  if (!type || !status || !message || !receiverId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const notification = await prisma.notification.create({
    data: {
      type,
      status,
      message,
      senderId: user.id,
      receiverId,
      relatedStudentId,
      ...(remarks !== undefined ? { remarks } : {}),
    },
  });
  return NextResponse.json({ notification });
} 