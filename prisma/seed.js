const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // Hash passwords for all roles
  const hashedSuperAdminPassword = await bcrypt.hash("superadmin123", 10);
  const hashedCollegePassword = await bcrypt.hash("college123", 10);
  const hashedHODPassword = await bcrypt.hash("hod123", 10);
  const hashedFacultyPassword = await bcrypt.hash("faculty123", 10);
  const hashedStudentPassword = await bcrypt.hash("student123", 10);

  // SUPER ADMIN
  const superAdminUser = await prisma.user.create({
    data: {
      email: "jerome@admin.com",
      password: hashedSuperAdminPassword,
      role: "SUPER_ADMIN",
    },
  });
  const superAdmin = await prisma.superAdmin.create({
    data: {
      userId: superAdminUser.id,
    }
  });
  console.log("✅ Super Admin Created:", superAdminUser.email);

  // COLLEGE
  const collegeUser = await prisma.user.create({
    data: {
      email: "admin@college.com",
      password: hashedCollegePassword,
      role: "COLLEGE",
    },
  });
  const college = await prisma.college.create({
    data: {
      userId: collegeUser.id,
      name: "Pugazh Ed University",
      affiliatedUniversity: "Anna Univ",
      deemedUniversity: "No",
      recognitionStatus: "NAAC",
      instituteCode: "STS",
      councilIssuingCode: "INST",
      // Set the collegeType as required (for example, "ARTS")
      collegeType: "ARTS",
    },
  });
  console.log("✅ College Created:", college.name);

  // DEPARTMENT
  // Since departments are controlled by the college, we don't create a separate user for departments.
  // Instead, we create a department record directly.
  const department = await prisma.department.create({
    data: {
      collegeId: college.id,
      name: "History", // For an ARTS college, for example.
    },
  });
  console.log("✅ Department Created:", department.name);

  // HOD
  const hodUser = await prisma.user.create({
    data: {
      email: "hod@hod.com",
      password: hashedHODPassword,
      role: "HOD",
    },
  });
  const hod = await prisma.hod.create({
    data: {
      userId: hodUser.id,
      name: "test hod",
      collegeId: college.id,
      departmentId: department.id,
    },
  });
  console.log("✅ HOD Created:", hod.name);

  // Optionally, update the department to associate it with the HOD
  await prisma.department.update({
    where: { id: department.id },
    data: { hod: { connect: { id: hod.id } } },
  });

  // FACULTY
  const facultyUser = await prisma.user.create({
    data: {
      email: "faculty@faculty.com",
      password: hashedFacultyPassword,
      role: "FACULTY",
    },
  });
  const faculty = await prisma.faculty.create({
    data: {
      userId: facultyUser.id,
      name: "Master JD",
      collegeId: college.id,
      departmentId: department.id,
      hodId: hod.id,
    },
  });
  console.log("✅ Faculty Created:", faculty.name);

  // STUDENT
  const studentUser = await prisma.user.create({
    data: {
      email: "student@student.com",
      password: hashedStudentPassword,
      role: "STUDENT",
    },
  });
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      name: "test student",
      collegeId: college.id,
      departmentId: department.id, // Optional; in this case, we're assigning it
      facultyId: faculty.id,
      rollNo: "STS01",
      personalEmail: "test.student1@gmail.com",
      DOB: new Date("2000-01-01"),
      phoneNo: "+1234567890",
      nationality: "Indian",
      countryCode: "IN",
      departmentName: department.name, // This matches the selected department name
      passportNo: "P987654321",
      passportExpiryDate: new Date("2030-12-31"),
    },
  });
  console.log("✅ Student Created:", student.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
