'use client';

import { useState, useEffect, useMemo } from 'react';
import { Student } from '@/types/student';

export default function StudentCrudPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form States for Add
  const [newSid, setNewSid] = useState('');
  const [newSname, setNewSname] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form States for Edit
  const [editSname, setEditSname] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // ฟังก์ชันดึงข้อมูลนักเรียนทั้งหมด
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/students');
      const data = await res.json();

      if (data.success) {
        setStudents(data.data || []);
      } else {
        setErrorMessage(data.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // แสดงผลแจ้งเตือนแบบหายไปเอง
  const showToast = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 6000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // จัดการเพิ่มนักเรียน
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSid.trim() || !newSname.trim() || !newPhone.trim()) {
      showToast('กรุณากรอกข้อมูลให้ครบทุกช่อง', true);
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sid: newSid.trim(),
          sname: newSname.trim(),
          phone: newPhone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'เพิ่มข้อมูลนักเรียนสำเร็จ!');
        setNewSid('');
        setNewSname('');
        setNewPhone('');
        setIsAddOpen(false);
        fetchStudents();
      } else {
        showToast(data.message || 'ไม่สามารถเพิ่มข้อมูลได้', true);
      }
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล', true);
    } finally {
      setFormSubmitting(false);
    }
  };

  // เปิด Modal แก้ไข
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditSname(student.sname);
    setEditPhone(String(student.phone));
  };

  // จัดการบันทึกการแก้ไข
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    if (!editSname.trim() || !editPhone.trim()) {
      showToast('กรุณากรอกชื่อและเบอร์โทรศัพท์', true);
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await fetch(`/api/students/${encodeURIComponent(editingStudent.sid)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sname: editSname.trim(),
          phone: editPhone.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'อัปเดตข้อมูลสำเร็จ!');
        setEditingStudent(null);
        fetchStudents();
      } else {
        showToast(data.message || 'ไม่สามารถแก้ไขข้อมูลได้', true);
      }
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล', true);
    } finally {
      setFormSubmitting(false);
    }
  };

  // จัดการลบนักเรียน
  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;

    try {
      setFormSubmitting(true);
      const res = await fetch(`/api/students/${encodeURIComponent(deletingStudent.sid)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'ลบข้อมูลเรียบร้อยแล้ว');
        setDeletingStudent(null);
        fetchStudents();
      } else {
        showToast(data.message || 'ไม่สามารถลบข้อมูลได้', true);
      }
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'เกิดข้อผิดพลาดในการลบข้อมูล', true);
    } finally {
      setFormSubmitting(false);
    }
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        String(s.sid).toLowerCase().includes(q) ||
        s.sname.toLowerCase().includes(q) ||
        String(s.phone).toLowerCase().includes(q)
    );
  }, [students, search]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/30">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">
                ระบบจัดการข้อมูลนักเรียน
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                PostgreSQL: <span className="font-mono text-slate-600">rytv.public.student (user: rytc)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm rounded-xl shadow-sm shadow-blue-600/25 transition-all duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มนักเรียน
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast Alerts */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-sm shadow-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2.5">
                <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="space-y-1">
                  <p className="font-semibold">{errorMessage}</p>
                  <p className="text-xs text-rose-600">
                    โปรดตรวจสอบไฟล์ <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">.env.local</code> (ค่าปัจจุบันคือ <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">postgresql://rytc:123456@172.23.20.212:5432/rytv</code>)
                  </p>
                </div>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Action Controls & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาด้วยรหัส (sid), ชื่อ (sname), หรือเบอร์โทร (phone)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ล้างคำค้น
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <span className="text-xs text-slate-500 font-medium px-2.5 py-1.5 bg-slate-100 rounded-lg">
              ทั้งหมด {filteredStudents.length} {search ? `(จาก ${students.length})` : ''} คน
            </span>
            <button
              onClick={fetchStudents}
              disabled={loading}
              title="รีเฟรชข้อมูล"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 disabled:opacity-50 transition cursor-pointer"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-3.5 px-6">รหัสนักศึกษา (sid)</th>
                  <th className="py-3.5 px-6">ชื่อ-นามสกุล (sname)</th>
                  <th className="py-3.5 px-6">เบอร์โทรศัพท์ (phone)</th>
                  <th className="py-3.5 px-6 text-right">จัดการ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-36"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-28"></div></td>
                      <td className="py-4 px-6 text-right"><div className="h-4 bg-slate-100 rounded w-16 ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <svg className="w-10 h-10 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="font-medium text-slate-600">
                          {search ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูลนักเรียนในตาราง'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {search ? 'ลองค้นหาด้วยคำอื่น หรือกดล้างคำค้น' : 'คลิกปุ่ม "เพิ่มนักเรียน" ด้านบนเพื่อเริ่มบันทึกข้อมูล'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={String(student.sid)} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-slate-800">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-md text-xs font-semibold text-blue-700">
                          {student.sid}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">{student.sname}</td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-xs">
                        {String(student.phone).padStart(10, '0')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไข"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingStudent(student)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: เพิ่มนักเรียนใหม่ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">เพิ่มข้อมูลนักเรียนใหม่</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสนักศึกษา (sid) <span className="text-rose-500">* (ตัวเลข)</span>
                </label>
                <input
                  type="number"
                  required
                  value={newSid}
                  onChange={(e) => setNewSid(e.target.value)}
                  placeholder="เช่น 69003"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (sname) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newSname}
                  onChange={(e) => setNewSname(e.target.value)}
                  placeholder="เช่น สมศักดิ์ มั่งคั่ง"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ (phone) <span className="text-rose-500">* (ตัวเลข)</span>
                </label>
                <input
                  type="number"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="เช่น 0876063677"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: แก้ไขข้อมูลนักเรียน */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">แก้ไขข้อมูลนักเรียน</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสนักศึกษา (sid)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingStudent.sid}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono text-sm cursor-not-allowed"
                />
                <span className="text-[11px] text-slate-400">Primary Key ไม่สามารถแก้ไขได้</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (sname) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editSname}
                  onChange={(e) => setEditSname(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ (phone) <span className="text-rose-500">* (ตัวเลข)</span>
                </label>
                <input
                  type="number"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: ยืนยันการลบ */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-900 text-center">ยืนยันการลบข้อมูล?</h3>
            <p className="text-xs text-slate-500 text-center mt-2">
              คุณต้องการลบข้อมูลของ{' '}
              <strong className="text-slate-700">
                {deletingStudent.sname}
              </strong>{' '}
              (รหัส: <span className="font-mono">{deletingStudent.sid}</span>) หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer flex-1"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={formSubmitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-sm transition disabled:opacity-50 cursor-pointer flex-1"
              >
                {formSubmitting ? 'กำลังลบ...' : 'ลบข้อมูล'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
