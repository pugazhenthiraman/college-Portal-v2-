import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized or missing college ID' }),
        { status: 401 }
      );
    }

    const collegeId = Number(session.user.collegeId);

    const departments = await prisma.department.findMany({
      where: { collegeId },
      select: { name: true },
    });

    const departmentNames = departments.map((d) => d.name);

    const workbook  : any = new ExcelJS.Workbook();
    const worksheet : any = workbook.addWorksheet('Student Template');

    // 1. Headers
    const headers = [
      'firstName', 'middleName', 'lastName', 'personalEmailId', 'rollNo',
      'DOB', 'phoneNo', 'secondaryPhoneNo', 'country', 'district',
      'state', 'departmentName',
    ];
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell : any ) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F46E5' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.protection = { locked: true }; // ✅ Lock header cells
    });

    // 2. Sample Row
    const sampleRow = worksheet.addRow([
      'John', 'A.', 'Doe', 'john@example.com', '10001',
      '2002-01-01', '9876543210', '8765432109', 'India', 'Chennai',
      'Tamil Nadu', departmentNames[0] || '',
    ]);

    sampleRow.eachCell((cell : any, colNumber : any ) => {
      if (headers[colNumber - 1] === 'DOB') {
        cell.numFmt = 'yyyy-mm-dd';
      }
      cell.protection = { locked: false }; // ✅ Unlock data entry row
    });

    worksheet.columns.forEach((col : any , index : any ) => {
      const header = headers[index];
      col.width = header.length < 15 ? 18 : header.length + 5;
    });

    worksheet.getCell('L1').note = 'Please select a department from the dropdown list';

    // 3. Department List Sheet (hidden)
    const deptSheet = workbook.addWorksheet('Departments');
    departmentNames.forEach((name, i) => {
      const cell = deptSheet.getCell(`A${i + 1}`);
      cell.value = name;
      cell.font = { name: 'Calibri', size: 12 };
    });
    deptSheet.columns = [{ width: 30 }];
    deptSheet.state = 'veryHidden';

    // 4. Dropdown Validation
    worksheet.dataValidations.add('L2:L1000', {
      type: 'list',
      allowBlank: false,
      formulae: [`=Departments!$A$1:$A$${departmentNames.length}`],
      showErrorMessage: true,
      errorStyle: 'error',
      errorTitle: 'Invalid Department',
      error: 'Please select a department from dropdown.',
    });

    // 5. Protect the worksheet (headers locked, input rows editable)
    await worksheet.protect('ClouSec2025', {
      selectLockedCells: false,
      selectUnlockedCells: true,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      deleteColumns: false,
      deleteRows: false,
      sort: false,
      autoFilter: false,
      objects: false,
      scenarios: false,
    });

    // 6. Finalize file
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=student-template.xlsx',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
