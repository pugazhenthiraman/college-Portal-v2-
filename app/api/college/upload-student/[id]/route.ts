import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify the user's session
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in" },
        { status: 401 }
      );
    }

    // Parse the user ID from the route (this is the id stored in the User table)
    const userId = Number(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Parse the incoming JSON body
    const body = await req.json();

    // Update the User record if email and/or password are provided.
    let updatedUser = null;
    if (body.email || body.password) {
      const updateUserData: { email?: string; password?: string } = {};
      if (body.email) updateUserData.email = body.email;
      if (body.password) {
        // Hash the password before updating
        const hashedPassword = await bcrypt.hash(body.password, SALT_ROUNDS);
        updateUserData.password = hashedPassword;
      }
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateUserData,
      });
    }

    // Update the Student record where userId matches the given userId.
    // The student record uses schema fields: firstName, middleName, lastName, personalEmailId, rollNo, DOB, phoneNo, secondaryPhoneNo, departmentName, country, district, and state.
    const updatedStudent = await prisma.student.update({
      where: { userId: userId },
      data: {
        firstName: body.firstName,
        middleName: body.middleName,  // Optional
        lastName: body.lastName,
        personalEmailId: body.personalEmailId,
        rollNo: body.rollNo,
        DOB: new Date(body.DOB),
        phoneNo: body.phoneNo,
        secondaryPhoneNo: body.secondaryPhoneNo,
        departmentName: body.departmentName,
        country: body.country,
        district: body.district,
        state: body.state,
      },
    });

    return NextResponse.json(
      { updatedUser, updatedStudent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
