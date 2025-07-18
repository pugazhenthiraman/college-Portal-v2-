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
  const where: any = {};
  if (type === "incoming") {
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
    include: {
      sender: { select: { id: true, email: true, role: true } },
      receiver: { select: { id: true, email: true, role: true } },
      relatedStudent: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  return NextResponse.json({ notifications });
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
  const { type, status, message, receiverId, relatedStudentId } = body;
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
    },
  });
  return NextResponse.json({ notification });
} 