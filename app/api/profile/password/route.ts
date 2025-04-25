// File: app/api/profile/password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = Number(session.user.id);
  const { currentPassword, newPassword, confirmPassword } = await req.json();

  // 1) Check all fields are present
  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: "currentPassword, newPassword and confirmPassword are all required" },
      { status: 400 }
    );
  }

  // 2) Ensure new and confirm match
  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New password and confirmation do not match" },
      { status: 400 }
    );
  }

  // 3) Fetch and verify current password
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    return NextResponse.json(
      { error: "Wrong current password" },
      { status: 403 }
    );
  }

  // 4) Prevent re-using the same password
  // If this is a validation-only request (all fields equal), skip this check and just validate current password
  if (currentPassword === newPassword && newPassword === confirmPassword) {
    // Only validate current password
    return NextResponse.json({ valid: true });
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "Your new password must be different from the old one" },
      { status: 400 }
    );
  }

  // 5) Hash & save the new password
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
