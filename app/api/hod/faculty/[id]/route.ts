import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const facultyId = Number(params.id);
    if (isNaN(facultyId)) {
      return NextResponse.json({ error: "Invalid faculty advisor ID" }, { status: 400 });
    }

    const { name, email, contactNo, aadhaarNo } = await req.json();

    if (!name || !email || !contactNo || !aadhaarNo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Step 1: Get the faculty advisor's linked userId
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      select: { userId: true },
    });

    if (!faculty) {
      return NextResponse.json({ error: "Faculty advisor not found" }, { status: 404 });
    }

    // Step 2: Update both Faculty and User tables
    const [updatedFaculty, updatedUser] = await prisma.$transaction([
      prisma.faculty.update({
        where: { id: facultyId },
        data: {
          name,
          contactNo,
          aadhaarNo,
        },
      }),
      prisma.user.update({
        where: { id: faculty.userId },
        data: {
          email,
        },
      }),
    ]);

    return NextResponse.json({
      message: "Faculty advisor updated successfully",
      faculty: {
        id: facultyId,
        name: updatedFaculty.name,
        email: updatedUser.email,
        contactNo: updatedFaculty.contactNo,
        aadhaarNo: updatedFaculty.aadhaarNo,
      },
    });
  } catch (error: any) {
    console.error("Error updating faculty advisor:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
