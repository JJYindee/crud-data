import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Student } from '@/types/student';

// GET: ดึงข้อมูลนักเรียนทั้งหมด
export async function GET() {
  try {
    const result = await query<Student>(
      'SELECT sid, sname, phone FROM student ORDER BY sid ASC'
    );
    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error('Error fetching students:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ไม่สามารถดึงข้อมูลนักเรียนได้ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล',
        error: err.message,
      },
      { status: 500 }
    );
  }
}

// POST: เพิ่มข้อมูลนักเรียนใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sid, sname, phone } = body;

    // ตรวจสอบค่าว่าง
    if (sid === undefined || sid === null || String(sid).trim() === '') {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกรหัสนักศึกษา (sid)' },
        { status: 400 }
      );
    }
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

    const sidNum = parseInt(String(sid).trim(), 10);
    const phoneNum = parseInt(String(phone).trim(), 10);

    if (isNaN(sidNum)) {
      return NextResponse.json(
        { success: false, message: 'รหัสนักศึกษา (sid) ต้องเป็นตัวเลข' },
        { status: 400 }
      );
    }
    if (isNaN(phoneNum)) {
      return NextResponse.json(
        { success: false, message: 'เบอร์โทรศัพท์ (phone) ต้องเป็นตัวเลข' },
        { status: 400 }
      );
    }

    const result = await query<Student>(
      'INSERT INTO student (sid, sname, phone) VALUES ($1, $2, $3) RETURNING sid, sname, phone',
      [sidNum, sname.trim(), phoneNum]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
        message: 'เพิ่มข้อมูลนักเรียนเรียบร้อยแล้ว',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string };
    console.error('Error creating student:', error);

    // ตรวจสอบ Unique constraint violation (รหัสนักศึกษาซ้ำ)
    if (err.code === '23505') {
      return NextResponse.json(
        {
          success: false,
          message: 'รหัสนักศึกษานี้ (sid) มีอยู่ในระบบแล้ว',
          error: err.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
