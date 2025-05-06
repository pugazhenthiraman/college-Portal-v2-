import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    // 1) Auth & HOD context
    const session: any = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'HOD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const hod = await prisma.hOD.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true, departmentId: true, collegeId: true },
    });
    if (!hod) return NextResponse.json({ error: 'HOD not found' }, { status: 404 });

    // --- Get filters from query ---
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");
    const year = searchParams.get("year");

    // 2) Fetch all students in this HOD’s department, with filters
    const students = await prisma.student.findMany({
      where: {
        hodId:        hod.id,
        departmentId: hod.departmentId,
        ...(section ? { section } : {}),
        ...(year ? { academicYear: year } : {}),
      },
      select: {
        firstName:       true,
        lastName:        true,
        user: { select: { email: true } },
        personalEmailId: true,
        rollNo:          true,
        departmentName:  true,
        DOB:             true,
        phoneNo:         true,
        secondaryPhoneNo:true,
        country:         true,
        district:        true,
        state:           true,
        academicYear:    true,
        section:         true,
        faculty: { select: { name: true } },  // existing assignment, if any
      },
    });

    // 3) Fetch this HOD’s faculty list for dropdown
    const faculty = await prisma.faculty.findMany({
      where: {
        hodId:        hod.id,
        departmentId: hod.departmentId,
        collegeId:    hod.collegeId,
      },
      select: { name: true },
    });
    const facultyNames = faculty.map(f => f.name);

    // 4) Build the Excel workbook
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Students');

    // Headers
    const headers = [
      'First Name','Last Name','Email','Personal Email',
      'Roll No','Department','DOB','Phone No',
      'Secondary Phone No','Country','District','State',
      'Academic Year','Section','Faculty'
    ];
    const headerRow = ws.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font      = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill      = { type:'pattern', pattern:'solid', fgColor:{argb:'FF4F46E5'} };
      cell.alignment = { vertical:'middle', horizontal:'center' };
      cell.border    = { top:{style:'thin'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'} };
      // Lock headers as well
      cell.protection = { locked: true };
    });

    // Hidden sheet for faculty dropdown values
    const fSheet = wb.addWorksheet('FacultyList');
    facultyNames.forEach((n,i) => {
      fSheet.getCell(`A${i+1}`).value = n;
    });
    fSheet.state = 'veryHidden';

    // Populate student rows
    for (const s of students) {
      const row = ws.addRow([
        s.firstName,
        s.lastName,
        s.user.email,
        s.personalEmailId,
        s.rollNo,
        s.departmentName,
        s.DOB.toISOString().slice(0,10),
        s.phoneNo,
        s.secondaryPhoneNo,
        s.country,
        s.district,
        s.state,
        s.academicYear,
        s.section,
        s.faculty?.name || '',  // pre-fill if there was an assignment
      ]);
      row.eachCell((cell, idx) => {
        // Columns 1–14 locked; column 15 (Faculty) unlocked
        if (idx === 15) {
          cell.protection = { locked: false };
        } else {
          cell.protection = { locked: true };
        }
        // date formatting
        if (headers[idx-1] === 'DOB') cell.numFmt = 'yyyy-mm-dd';
      });
    }

    // Set column widths
    ws.columns.forEach((col, i) => {
      col.width = headers[i].length < 15 ? 18 : headers[i].length + 5;
    });

    // Apply dropdown validation to Faculty column (O)
    for (let r = 2; r <= students.length + 1; r++) {
      ws.getCell(`O${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`=FacultyList!$A$1:$A$${facultyNames.length}`],
        showErrorMessage: true,
        errorTitle: 'Invalid Faculty',
        error: 'Please choose a faculty from the dropdown'
      };
    }

    // 5) Protect the sheet so locked cells cannot be edited
    await ws.protect('', {
      selectLockedCells:   true,
      selectUnlockedCells: true,
      formatCells:         false,
      formatColumns:       false,
      formatRows:          false,
      insertColumns:       false,
      insertRows:          false,
      deleteColumns:       false,
      deleteRows:          false,
      sort:                false,
      autoFilter:          false,
      pivotTables:         false
    });

    // 6) Send file
    const buffer = await wb.xlsx.writeBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=students-with-faculty-template.xlsx`,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}