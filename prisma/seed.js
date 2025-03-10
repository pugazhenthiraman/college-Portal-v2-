import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Hash passwords for all roles
  const hashedSuperAdminPassword = await bcrypt.hash('superadmin123', 10);
  const hashedCollegePassword = await bcrypt.hash('college123', 10);
  const hashedDepartmentPassword = await bcrypt.hash('dept123', 10);
  const hashedHODPassword = await bcrypt.hash('hod123', 10);
  const hashedFacultyPassword = await bcrypt.hash('faculty123', 10);
  const hashedStudentPassword = await bcrypt.hash('student123', 10);

  // SUPER ADMIN
  const superAdminUser = await prisma.user.create({
    data: {
      email: "jerome@admin.com",
      password: hashedSuperAdminPassword,
      role: "SUPER_ADMIN"
    }
  });
  const superAdmin = await prisma.superAdmin.create({
    data: {
      userId: superAdminUser.id,
    }
  });
  console.log("✅ Super Admin Created:", superAdminUser.email);

  // COLLEGE (College Admin)
  const collegeUser = await prisma.user.create({
    data: {
      email: "admin@college.com",
      password: hashedCollegePassword,
      role: "COLLEGE"
    }
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
      // address and remark are optional; status defaults to PENDING.
    }
  });
  console.log("✅ College Created:", college.name);

  // DEPARTMENT
  const departmentUser = await prisma.user.create({
    data: {
      email: "dept@dept.com",
      password: hashedDepartmentPassword,
      role: "DEPARTMENT"
    }
  });
  const department = await prisma.department.create({
    data: {
      userId: departmentUser.id,
      name: "test_dept",
      collegeId: college.id,
    }
  });
  console.log("✅ Department Created:", department.name);

  // HEAD OF DEPARTMENT (HOD)
  const hodUser = await prisma.user.create({
    data: {
      email: "hod@hod.com",
      password: hashedHODPassword,
      role: "HOD"
    }
  });
  const hod = await prisma.hOD.create({
    data: {
      userId: hodUser.id,
      name: "test hod",
      collegeId: college.id,
      departmentId: department.id,
    }
  });
  console.log("✅ HOD Created:", hod.name);

  // FACULTY
  const facultyUser = await prisma.user.create({
    data: {
      email: "faculty@faculty.com",
      password: hashedFacultyPassword,
      role: "FACULTY"
    }
  });
  const faculty = await prisma.faculty.create({
    data: {
      userId: facultyUser.id,
      name: "Master JD",
      collegeId: college.id,
      departmentId: department.id,
      hodId: hod.id,
    }
  });
  console.log("✅ Faculty Created:", faculty.name);

  // STUDENT
  const studentUser = await prisma.user.create({
    data: {
      email: "student@student.com",
      password: hashedStudentPassword,
      role: "STUDENT"
    }
  });
  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      name: "test student",
      collegeId: college.id,
      departmentId: department.id,
      facultyId: faculty.id,
    }
  });
  console.log("✅ Student Created:", student.name);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
