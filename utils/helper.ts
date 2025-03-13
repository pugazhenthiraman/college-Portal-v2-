import { PrismaClient, UserRole } from "@prisma/client";
import  prisma  from "@/lib/prisma";

export const insertStudents = async (data: any[]) => {
  try {
    // 1️⃣ Insert Users First (Prisma `createMany()`)
    const usersData = data.map(item => ({
      email: item.email,
      password: item.hashedPassword,
      role: UserRole.STUDENT
    }));

    await prisma.user.createMany({
      data: usersData,
      skipDuplicates: true, // Prevent duplicate emails
    });

    // 2️⃣ Fetch Inserted User IDs
    const userRecords = await prisma.user.findMany({
      where: { email: { in: data.map(d => d.email) } },
      select: { id: true, email: true }
    });

    console.log("User Records Before Mapping:", userRecords);

    const userIdMap = userRecords.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {} as Record<string, number>);

    console.log("User ID Map:", userIdMap); // ✅ Debugging user ID mapping

    const studentsData = data
    .map((item) => {
      const userId = userIdMap[item.email];
      if (!userId) {
        console.error(`❌ Missing userId for ${item.email}`);
        return null; // Skip invalid rows
      }
  
      // ✅ Properly escape single quotes in strings
      const name = item.name.replace(/'/g, "''");
      const rollNo = item.rollNo.replace(/'/g, "''");
      const personalEmail = item.personalEmail.replace(/'/g, "''");
      const departmentName = item.departmentName.replace(/'/g, "''");
  
      return `(${userId}, '${name}', ${item.collegeId}, '${departmentName}', '${rollNo}', 
        '${personalEmail}', '${item.DOB}', '${item.phoneNo}', '${item.nationality}', 
        '${item.countryCode}', ${item.facultyId ? item.facultyId : "NULL"}, ${item.hodId ? item.hodId : "NULL"})`;
    })
    .filter(Boolean) // ✅ Remove invalid rows
    .join(",");
  
  if (!studentsData) {
    console.error("❌ No valid student data to insert");
    return { success: false, message: "No valid students to insert" };
  }
  
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Student" ("userId", "name", "collegeId", "departmentName", "rollNo", "personalEmail", "DOB", "phoneNo", "nationality",
    "countryCode", "facultyId", "hodId") 
    VALUES ${studentsData} 
    ON CONFLICT ("rollNo") 
    DO UPDATE SET 
      "name" = EXCLUDED."name",
      "collegeId" = EXCLUDED."collegeId",
      "departmentName" = EXCLUDED."departmentName",
      "personalEmail" = EXCLUDED."personalEmail",
      "DOB" = EXCLUDED."DOB",
      "phoneNo" = EXCLUDED."phoneNo",
      "nationality" = EXCLUDED."nationality",
      "countryCode" = EXCLUDED."countryCode",
      "facultyId" = EXCLUDED."facultyId",
      "hodId" = EXCLUDED."hodId";
  `);
  

    return { success: true, message: "Students inserted successfully" };
  } catch (error) {
    console.error("Error inserting students:", error);
    return { success: false, message: error.message };
  }
};
