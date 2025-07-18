import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const notificationId = parseInt(params.id, 10);
  if (isNaN(notificationId)) {
    return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
  }
  // Ensure the notification belongs to the user (as receiver)
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.receiverId !== user.id) {
    return NextResponse.json({ error: "Not found or not allowed" }, { status: 404 });
  }
  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
  return NextResponse.json({ notification: updated });
} 