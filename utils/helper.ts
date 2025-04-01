import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

export const insertStudents = async (data: any[]) => {
  try {
    // 1️⃣ Insert Users (for each row, create a User record with email, password, and role STUDENT)
    const userData = data.map((d) => ({
      email: d.email,
      password: d.password,
      role: UserRole.STUDENT,
    }));

    await prisma.user.createMany({
      data: userData,
      skipDuplicates: true,
    });

    // 2️⃣ Fetch inserted users to map emails to user IDs
    const users = await prisma.user.findMany({
      where: { email: { in: data.map((d) => d.email) } },
      select: { id: true, email: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.email.toLowerCase()] = user.id;
      return acc;
    }, {} as Record<string, number>);

    // 3️⃣ Prepare raw SQL insertion for the Student table.
    // We'll insert the columns for which we have data.
    const format = (val: any) => {
      if (val === null || val === undefined) return "NULL";
      return `'${String(val).replace(/'/g, "''")}'`;
    };

    const values = data
      .map((item) => {
        const userId = userMap[item.email.toString().toLowerCase()];
        if (!userId) return null;

        // Safely convert DOB:
        let dobString: string;
        if (item.DOB instanceof Date) {
          dobString = item.DOB.toISOString();
        } else {
          const parsedDate = new Date(item.DOB);
          if (isNaN(parsedDate.getTime())) {
            throw new Error("Invalid time value");
          }
          dobString = parsedDate.toISOString();
        }

        return `(
          ${userId},
          ${format(item.firstName)},
          ${format(item.middleName || null)},
          ${format(item.lastName)},
          ${format(item.rollNo)},
          ${format(item.personalEmailId)},
          '${dobString}',
          ${format(item.phoneNo)},
          ${format(item.secondaryPhoneNo)},
          ${format(item.country)},
          ${format(item.district)},
          ${format(item.state)},
          ${format(item.departmentName)},
          ${item.collegeId}
        )`;
      })
      .filter(Boolean)
      .join(",");

    if (!values) {
      return { success: false, message: "No valid student data to insert" };
    }

    // 4️⃣ Execute UPSERT via raw SQL.
    // Here we assume that rollNo is unique.
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Student" (
        "userId", "firstName", "middleName", "lastName", "rollNo",
        "personalEmailId", "DOB", "phoneNo", "secondaryPhoneNo",
        "country", "district", "state", "departmentName", "collegeId"
      )
      VALUES ${values}
      ON CONFLICT ("rollNo") DO UPDATE SET
        "firstName" = EXCLUDED."firstName",
        "middleName" = EXCLUDED."middleName",
        "lastName" = EXCLUDED."lastName",
        "personalEmailId" = EXCLUDED."personalEmailId",
        "DOB" = EXCLUDED."DOB",
        "phoneNo" = EXCLUDED."phoneNo",
        "secondaryPhoneNo" = EXCLUDED."secondaryPhoneNo",
        "country" = EXCLUDED."country",
        "district" = EXCLUDED."district",
        "state" = EXCLUDED."state",
        "departmentName" = EXCLUDED."departmentName",
        "collegeId" = EXCLUDED."collegeId";
    `);

    return { success: true, message: "Students inserted successfully" };
  } catch (error: any) {
    console.error("❌ Error inserting students:", error);
    return { success: false, message: error.message || "Error inserting students" };
  }
};
