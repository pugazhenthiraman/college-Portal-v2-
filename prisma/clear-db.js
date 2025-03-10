const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.college.deleteMany();
    await prisma.superAdmin.deleteMany();
    await prisma.department.deleteMany();
    await prisma.hOD.deleteMany();
    await prisma.faculty.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ All data deleted successfully");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
