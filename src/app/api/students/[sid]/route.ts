import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Student } from '@/types/student';

interface RouteContext {
  params: Promise<{ sid: string }>;
}

// GET: ดึงข้อมูลนักเรียนรายคน
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { sid } = await context.params;
    const sidNum = parseInt(sid, 10);
    if (isNaN(sidNum)) {
      return NextResponse.json(
        { success: false, message: 'รหัสนักศึกษาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const result = await query<Student>(
      'SELECT sid, sname, phone FROM student WHERE sid = $1',
      [sidNum]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `ไม่พบข้อมูลนักเรียนรหัส ${sid}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error fetching student by sid:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล',
        error: err.message,
      },
      { status: 500 }
    );
  }
}

// PUT: แก้ไขข้อมูลนักเรียน
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { sid } = await context.params;
    const sidNum = parseInt(sid, 10);
    if (isNaN(sidNum)) {
      return NextResponse.json(
        { success: false, message: 'รหัสนักศึกษาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { sname, phone } = body;

    if (!sname || typeof sname !== 'string' || !sname.trim()) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกชื่อ (sname)' },
        { status: 400 }
      );
    }
    if (phone === undefined || phone === null || String(phone).trim() === '') {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกเบอร์โทรศัพท์ (phone)' },
        { status: 400 }
      );
    }

    const phoneNum = parseInt(String(phone).trim(), 10);
    if (isNaN(phoneNum)) {
      return NextResponse.json(
        { success: false, message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข' },
        { status: 400 }
      );
    }

    const result = await query<Student>(
      'UPDATE student SET sname = $1, phone = $2 WHERE sid = $3 RETURNING sid, sname, phone',
      [sname.trim(), phoneNum, sidNum]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: `ไม่พบข้อมูลนักเรียนรหัส ${sid} ที่ต้องการแก้ไข` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว',
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error updating student:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
        error: err.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: ลบข้อมูลนักเรียน
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { sid } = await context.params;
    const sidNum = parseInt(sid, 10);
    if (isNaN(sidNum)) {
      return NextResponse.json(
        { success: false, message: 'รหัสนักศึกษาไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const result = await query<Student>(
      'DELETE FROM student WHERE sid = $1 RETURNING sid, sname, phone',
      [sidNum]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: `ไม่พบข้อมูลนักเรียนรหัส ${sid} ที่ต้องการลบ` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: `ลบข้อมูลนักเรียนรหัส ${sid} สำเร็จ`,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Error deleting student:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการลบข้อมูล',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
