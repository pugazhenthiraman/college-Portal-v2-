// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// // Optionally import bcrypt if you need to hash a new password:
// // import bcrypt from "bcrypt";



// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     // Verify the user's session
//     const session: any = await getServerSession(authOptions);
//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
//     }

//     // Parse the user ID from the route (this is the id stored in the User table)
//     const userId = Number(params.id);
//     if (isNaN(userId)) {
//       return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
//     }

//     // Parse the incoming JSON body
//     const body = await req.json();

//     // Update the User record if email and/or password are provided.
//     // (Password should be hashed before storing in a production app.)
//     let updatedUser = null;
//     if (body.email || body.password) {
//       const updateUserData: { email?: string; password?: string } = {};
//       if (body.email) updateUserData.email = body.email;
//       if (body.password) {
//         // Uncomment and use bcrypt to hash password if desired:
//         // const hashedPassword = await bcrypt.hash(body.password, 10);
//         // updateUserData.password = hashedPassword;
//         updateUserData.password = body.password;
//       }
//       updatedUser = await prisma.user.update({
//         where: { id: userId },
//         data: updateUserData,
//       });
//     }

//     // Update the Student record where userId matches the given userId.
//     // The student model is linked to the user via the userId field.
//     const updatedStudent = await prisma.student.update({
//       where: { userId: userId },
//       data: {
//         name: body.name,
//         rollNo: body.rollNo,
//         personalEmail: body.personalEmail,
//         // Convert DOB string to Date
//         DOB: new Date(body.DOB),
//         phoneNo: body.phoneNo,
//         nationality: body.nationality,
//         departmentName: body.departmentName,
//         countryCode: body.countryCode,
//         // Add any other fields if needed
//       },
//     });

//     return NextResponse.json({ updatedUser, updatedStudent }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error updating student:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing

const SALT_ROUNDS = 10; // Define salt rounds for bcrypt

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify the user's session
    const session: any = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
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
    const updatedStudent = await prisma.student.update({
      where: { userId: userId },
      data: {
        name: body.name,
        rollNo: body.rollNo,
        personalEmail: body.personalEmail,
        // Convert DOB string to Date
        DOB: new Date(body.DOB),
        phoneNo: body.phoneNo,
        nationality: body.nationality,
        departmentName: body.departmentName,
        countryCode: body.countryCode,
        // Add any other fields if needed
      },
    });

    return NextResponse.json({ updatedUser, updatedStudent }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}