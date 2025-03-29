import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(_req: NextRequest) {
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

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Student Template');

    // 1. Define headers with updated order:
    // A: firstName, B: lastName, C: email, D: password, E: personalEmailId, F: rollNo,
    // G: departmentName, H: DOB, I: phoneNo, J: secondaryPhoneNo, K: country, L: district, M: state
    const headers = [
      'firstName',
      'lastName',
      'email',
      'password',
      'personalEmailId',
      'rollNo',
      'departmentName', // Now in column G
      'DOB',
      'phoneNo',
      'secondaryPhoneNo',
      'country',
      'district',
      'state',
    ];
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell: any) => {
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
      // Leave header cells unlocked
      cell.protection = { locked: false };
    });

    // 2. Add a sample data row matching the new header order.
    const sampleRow = worksheet.addRow([
      'John',                    // firstName
      'Doe',                     // lastName
      'johnDoe@gmail.com',       // email
      '123456789',               // password
      'john@example.com',        // personalEmailId
      '10001',                   // rollNo
      departmentNames[0] || '',  // departmentName (Column G)
      '2002-01-01',              // DOB
      '9876543210',              // phoneNo
      '8765432109',              // secondaryPhoneNo
      'India',                   // country
      'Chennai',                 // district
      'Tamil Nadu',              // state
    ]);

    sampleRow.eachCell((cell: any, colNumber: number) => {
      if (headers[colNumber - 1] === 'DOB') {
        cell.numFmt = 'yyyy-mm-dd';
      }
      // Unlock sample row cells
      cell.protection = { locked: false };
    });

    // Dynamically set column widths based on header text.
    worksheet.columns.forEach((col: any, index: number) => {
      const header = headers[index];
      if (header) {
        col.width = header.length < 15 ? 18 : header.length + 5;
      }
    });

    // 3. Add a note for the department header cell (Column G)
    worksheet.getCell('G1').note =
      'Please select a department from the dropdown list';

    // 4. Create a hidden Department List Sheet for dropdown values.
    const deptSheet = workbook.addWorksheet('Departments');
    departmentNames.forEach((name, i) => {
      const cell = deptSheet.getCell(`A${i + 1}`);
      cell.value = name;
      cell.font = { name: 'Calibri', size: 12 };
    });
    deptSheet.columns = [{ width: 30 }];
    deptSheet.state = 'veryHidden';

    // 5. Apply dropdown validation for the departmentName column (Column G)
    // Loop from row 2 to 5000 and set validation individually.
    for (let row = 2; row <= 5000; row++) {
      const cell = worksheet.getCell(`G${row}`);
      cell.dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [`=Departments!$A$1:$A$${departmentNames.length}`],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Department',
        error: 'Please select a department from dropdown.',
      };
    }

    // 6. Unlock all cells (except header row) in the worksheet.
    worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      if (rowNumber !== 1) {
        row.eachCell({ includeEmpty: true }, (cell: any) => {
          cell.protection = { locked: false };
        });
      }
    });

    // 7. Finalize the Excel file and return it as a downloadable attachment.
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
