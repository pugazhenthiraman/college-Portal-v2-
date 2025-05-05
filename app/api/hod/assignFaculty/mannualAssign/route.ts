import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { Buffer } from 'buffer'

const EXPECTED_HEADERS = [
  'First Name','Last Name','Email','Personal Email',
  'Roll No','Department','DOB','Phone No',
  'Secondary Phone No','Country','District','State',
  'Academic Year','Section','Faculty'
]

export async function POST(req: NextRequest) {
  try {
    // 1) Auth
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'HOD') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2) Read file
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer) as Buffer

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // 3) Get worksheet
    const ws = workbook.getWorksheet('Students')
    if (!ws) {
      return NextResponse.json(
        { error: 'Worksheet "Students" not found' },
        { status: 400 }
      )
    }

    // 4) Validate headers
    const rawHeader = Array.isArray(ws.getRow(1).values)
      ? ws.getRow(1).values as ExcelJS.CellValue[]
      : Object.values(ws.getRow(1).values as Record<string, ExcelJS.CellValue>)
    const headers = rawHeader.slice(1).map(h => String(h))
    if (
      headers.length !== EXPECTED_HEADERS.length ||
      !EXPECTED_HEADERS.every((h, i) => headers[i] === h)
    ) {
      return NextResponse.json(
        { error: 'Excel headers do not match the required format.' },
        { status: 400 }
      )
    }

    // 5) Load HOD context
    const hod = await prisma.hOD.findUnique({
      where: { userId: Number(session.user.id) },
      select: { id: true, departmentId: true, collegeId: true },
    })
    if (!hod) {
      return NextResponse.json({ error: 'HOD not found' }, { status: 404 })
    }

    // 6) Fetch DB students
    const dbStudents = await prisma.student.findMany({
      where: {
        hodId: hod.id,
        departmentId: hod.departmentId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        departmentName: true,
        DOB: true,
        phoneNo: true,
        secondaryPhoneNo: true,
        country: true,
        district: true,
        state: true,
        academicYear: true,
        section: true,
        personalEmailId: true,
        user: { select: { email: true } },
        faculty: { select: { name: true } },
      },
    })
    const studentMap = new Map<string, typeof dbStudents[0]>()
    dbStudents.forEach(s => studentMap.set(s.rollNo, s))

    // 6.1) Fetch all valid faculty for this HOD/department/college
    const facultyList = await prisma.faculty.findMany({
      where: {
        hodId: hod.id,
        departmentId: hod.departmentId,
        collegeId: hod.collegeId,
      },
      select: { id: true, name: true, sections: true },
    })
    const facultyMap = new Map(
      facultyList.map(f => [f.name.trim(), { id: f.id, sections: f.sections }])
    )

    // 7) Validate rows & collect updates
    const errors: string[] = []
    const updates: Array<{ id: number; facultyName: string; section: string; rollNo: string }> = []

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return

      const rawValues = Array.isArray(row.values)
        ? row.values as ExcelJS.CellValue[]
        : Object.values(row.values as Record<string, ExcelJS.CellValue>)
      const [
        firstName, lastName, email, personalEmailId,
        rollNo, departmentName, DOB, phoneNo,
        secondaryPhoneNo, country, district, state,
        academicYear, section, facultyName
      ] = rawValues.slice(1).map(v => String(v ?? ''))

      const db = studentMap.get(rollNo)
      if (!db) {
        errors.push(`Row ${rowNumber}: No student with Roll No "${rollNo}"`)
        return
      }

      const mismatches: string[] = []
      if (db.firstName !== firstName)                  mismatches.push('First Name')
      if (db.lastName  !== lastName)                   mismatches.push('Last Name')
      if (db.user.email!== email)                      mismatches.push('Email')
      if (db.personalEmailId!== personalEmailId)       mismatches.push('Personal Email')
      if (db.departmentName!== departmentName)         mismatches.push('Department')
      if ((db.DOB instanceof Date
            ? db.DOB.toISOString().slice(0,10)
            : String(db.DOB)) !== DOB)                   mismatches.push('DOB')
      if (db.phoneNo   !== phoneNo)                    mismatches.push('Phone No')
      if (db.secondaryPhoneNo!== secondaryPhoneNo)     mismatches.push('Secondary Phone No')
      if (db.country   !== country)                    mismatches.push('Country')
      if (db.district  !== district)                   mismatches.push('District')
      if (db.state     !== state)                      mismatches.push('State')
      if (db.academicYear!== academicYear)             mismatches.push('Academic Year')
      if (db.section   !== section)                    mismatches.push('Section')

      if (mismatches.length) {
        errors.push(`Row ${rowNumber}: mismatched ${mismatches.join(', ')}`)
        return
      }

      // Validate faculty name
      if (facultyName && !facultyMap.has(facultyName.trim())) {
        errors.push(`Row ${rowNumber} (Roll No: ${rollNo}): No faculty available with the name "${facultyName}". Please use the dropdown values only.`)
        return
      }

      updates.push({ id: db.id, facultyName, section, rollNo })
    })

    // Log what was received from Excel
    console.log("Excel upload received rows:", updates)

    if (errors.length) {
      // Log what is being sent to UI in case of error
      console.log("Excel upload validation errors:", errors)
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // 8) Persist faculty changes
    for (const { id, facultyName, section, rollNo } of updates) {
      let facId: number | null = null
      let facSections: string[] = []
      if (facultyName) {
        const fac = facultyMap.get(facultyName.trim())
        facId = fac?.id ?? null
        facSections = fac?.sections ?? []
        // Add section to faculty.sections if not present
        if (facId && section && !facSections.includes(section)) {
          await prisma.faculty.update({
            where: { id: facId },
            data: { sections: { push: section } },
          })
        }
      }

      // Log what is being updated for each student
      console.log(`Assigning student ${id} (rollNo: ${rollNo}) to facultyId:`, facId, "for facultyName:", facultyName)

      // Update the student's facultyId
      await prisma.student.update({
        where: { id },
        data: { facultyId: facId },
      })
    }

    // 9) Recalculate sections for each faculty involved
    const facultyIds = Array.from(new Set(
      updates
        .map(u => {
          const fac = facultyMap.get(u.facultyName?.trim() || "");
          return fac?.id;
        })
        .filter(Boolean)
    ));

    for (const facId of facultyIds) {
      // Find all unique sections where this faculty has students
      const students = await prisma.student.findMany({
        where: { facultyId: facId },
        select: { section: true },
      });
      const uniqueSections = Array.from(new Set(students.map(s => s.section).filter((section): section is string => section !== null)));
      await prisma.faculty.update({
        where: { id: facId },
        data: { sections: uniqueSections },
      });
    }

    // Log what is being sent to UI on success
    console.log("Excel upload success, updated students:", updates.length)

    return NextResponse.json({ success: true, updated: updates.length })
  } catch (err) {
    console.error('Excel upload error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}