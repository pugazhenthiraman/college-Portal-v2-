import { UserRole } from "@prisma/client";
import prisma from "@/lib/prisma";

export const insertStudents = async (data: any[]) => {
  try {
    // 1️⃣ Insert Users
    const userData = data.map(d => ({
      email: d.email,
      password: d.password,
      role: UserRole.STUDENT,
    }));

    await prisma.user.createMany({
      data: userData,
      skipDuplicates: true,
    });

    // 2️⃣ Fetch inserted users to map userIds
    const users = await prisma.user.findMany({
      where: { email: { in: data.map(d => d.email) } },
      select: { id: true, email: true },
    });

    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {} as Record<string, number>);

    // 3️⃣ Prepare raw SQL
    const values = data
      .map((item) => {
        const userId = userMap[item.email];
        if (!userId) return null;

        const format = (val: string | null | undefined) =>
          val ? `'${String(val).replace(/'/g, "''")}'` : "NULL";

        return `(
          ${userId},
          ${format(item.firstName)},
          ${format(item.middleName)},
          ${format(item.lastName)},
          ${format(item.rollNo)},
          ${format(item.personalEmail)},
          '${item.DOB.toISOString()}',
          ${format(item.phoneNo)},
          ${format(item.secondaryPhoneNo)},
          ${format(item.nationality)},
          ${format(item.countryCode)},
          ${format(item.departmentName)},
          ${item.collegeId},
          ${item.departmentId ?? "NULL"},
          ${item.facultyId ?? "NULL"},
          ${item.hodId ?? "NULL"},
          ${format(item.passportNo)},
          ${item.passportExpiryDate ? `'${item.passportExpiryDate.toISOString()}'` : "NULL"}
        )`;
      })
      .filter(Boolean)
      .join(",");

    if (!values) return { success: false, message: "No valid data to insert" };

    // 4️⃣ Execute fast UPSERT via raw SQL
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Student" (
        "userId", "firstName", "middleName", "lastName", "rollNo",
        "personalEmailId", "DOB", "phoneNo", "secondaryPhoneNo", "nationality",
        "countryCode", "departmentName", "collegeId", "departmentId",
        "facultyId", "hodId", "passportNo", "passportExpiryDate"
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
        "nationality" = EXCLUDED."nationality",
        "countryCode" = EXCLUDED."countryCode",
        "departmentName" = EXCLUDED."departmentName",
        "collegeId" = EXCLUDED."collegeId",
        "departmentId" = EXCLUDED."departmentId",
        "facultyId" = EXCLUDED."facultyId",
        "hodId" = EXCLUDED."hodId",
        "passportNo" = EXCLUDED."passportNo",
        "passportExpiryDate" = EXCLUDED."passportExpiryDate";
    `);

    return { success: true, message: "Students inserted successfully" };
  } catch (error: any) {
    console.error("❌ Error inserting students:", error);
    return { success: false, message: error.message };
  }
};
