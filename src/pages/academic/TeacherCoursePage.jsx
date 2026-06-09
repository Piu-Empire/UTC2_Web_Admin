// src/pages/academic/TeacherCoursePage.jsx
// Admin/lv5: phân công giảng viên dạy môn
import { useState } from 'react';
import { Search, Plus, Trash2, X, Users } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const SELECT = `${INPUT} cursor-pointer`;

function AssignModal({ onClose, onAssigned }) {
  const [form, setForm] = useState({ userId: '', courseId: '', semesterId: '', className: '' });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.userId || !form.courseId || !form.semesterId) {
      alert('Vui lòng điền đầy đủ User ID giảng viên, Course ID và Semester ID');
      return;
    }
    setSaving(true);
    try {
      const res = await academicApi.assignTeacher(
        Number(form.userId), Number(form.courseId),
        Number(form.semesterId), form.className || undefined
      );
      onAssigned(res.data?.data);
      onClose();
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.message ?? e.message));
    } finally { setSaving(false); }
  }

  const F = ({ label, children }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-ink-subtle">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[420px]">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-ink">Phân công giảng viên</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-hover text-ink-subtle"><X size={16}/></button>
        </div>
        <div className="p-6 space-y-4">
          <F label="User ID giảng viên (STAFF lv2) *">
            <input value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
              placeholder="VD: 6" className={`${INPUT} w-full`}/>
          </F>
          <F label="Course ID (mã môn) *">
            <input value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
              placeholder="VD: 1" className={`${INPUT} w-full`}/>
          </F>
          <F label="Semester ID (kỳ học) *">
            <input value={form.semesterId} onChange={e => setForm(f => ({ ...f, semesterId: e.target.value }))}
              placeholder="VD: 4" className={`${INPUT} w-full`}/>
          </F>
          <F label="Tên lớp (để trống = tất cả lớp)">
            <input value={form.className} onChange={e => setForm(f => ({ ...f, className: e.target.value }))}
              placeholder="VD: 65TH3" className={`${INPUT} w-full`}/>
          </F>
        </div>
        <div className="px-6 py-4 border-t border-surface-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-border rounded-lg hover:bg-surface-hover transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium transition-colors">
            {saving ? 'Đang lưu...' : 'Phân công'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeacherCoursePage() {
  const [userId,   setUserId]   = useState('');
  const [input,    setInput]    = useState('');
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setUserId(id); setLoading(true); setSearched(true);
    try {
      const res = await academicApi.getTeacherCourses(id);
      setCourses(res.data?.data ?? []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }

  async function handleRemove(id) {
    if (!confirm('Xoá phân công này?')) return;
    try {
      await academicApi.removeTeacherCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  function handleAssigned(tc) {
    if (tc) setCourses(prev => [tc, ...prev]);
  }

  return (
    <div className="space-y-5 max-w-[900px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Phân công giảng viên</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Quản lý môn học được phân công cho từng giảng viên</p>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-ink-subtle flex-shrink-0"/>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID giảng viên..." className={`${INPUT} w-64`}/>
        <button onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 font-medium transition-colors">
          Tra cứu
        </button>
        {searched && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50 font-medium transition-colors ml-auto">
            <Plus size={15}/> Thêm phân công
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : searched && courses.length === 0 ? (
          <EmptyState icon={<Users size={40} className="text-ink-subtle"/>}
            title="Chưa có phân công" message="Giảng viên này chưa được phân công môn học nào"/>
        ) : courses.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
              <tr>
                {['Mã môn','Tên môn','Kỳ học','Lớp',''].map((h,i) => (
                  <th key={i} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{c.courseCode || `ID: ${c.courseId}`}</td>
                  <td className="px-4 py-3 font-medium text-ink">{c.courseName || '—'}</td>
                  <td className="px-4 py-3 text-ink-subtle">{c.semesterName || `ID: ${c.semesterId}`}</td>
                  <td className="px-4 py-3">{c.className ?? <span className="text-ink-subtle italic">Tất cả lớp</span>}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleRemove(c.id)}
                      className="p-1.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-subtle text-sm">
            Nhập User ID giảng viên để tra cứu
          </div>
        )}
      </div>

      {showAdd && <AssignModal onClose={() => setShowAdd(false)} onAssigned={handleAssigned}/>}
    </div>
  );
}