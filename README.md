# CRUD Data - Next.js + PostgreSQL

ระบบ CRUD ข้อมูลนักเรียน (student) เชื่อมต่อกับ PostgreSQL โดยใช้ Next.js 16 (App Router), Tailwind CSS v4, และ `pg` (node-postgres)

## การเริ่มต้นใช้งาน (Getting Started)

1. คัดลอกไฟล์ `.env.example` เป็น `.env.local` และตั้งค่าการเชื่อมต่อฐานข้อมูล:
```bash
cp .env.example .env.local
```

2. ติดตั้ง Dependencies และรันโปรเจกต์:
```bash
npm install
npm run dev
```

3. เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)
