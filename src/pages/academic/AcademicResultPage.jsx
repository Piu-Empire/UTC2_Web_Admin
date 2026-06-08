// src/pages/academic/AcademicResultPage.jsx
// Xem kết quả học tập theo lớp + môn — dùng cho lv3+ và Admin
import { useState } from 'react';
import { Search, GraduationCap, ClipboardList } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';
import { gpaColor } from '../../utils/formatters';

const INPUT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

function gradeVariant(letter) {
  if (!letter) return 'neutral';
  if (['A+','A'].includes(letter))  return 'success';
  if (['B+','B'].includes(letter))  return 'info';
  if (['C+','C'].includes(letter))  return 'warning';
  return 'error';
}

export default function AcademicResultPage() {
  const [courseId,  setCourseId]  = useState('');
  const [className, setClassName] = useState('');
  const [grades,    setGrades]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [searched,  setSearched]  = useState(false);

  async function handleSearch() {
    if (!courseId) return;
    setLoading(true); setSearched(true);
    try {
      const res = await academicApi.getGradesByCourse(Number(courseId), className || undefined);
      setGrades(res.data?.data ?? []);
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.message ?? e.message));
      setGrades([]);
    } finally { setLoading(false); }
  }

  const passed   = grades.filter(g => g.isPassed === true).length;
  const failed   = grades.filter(g => g.isPassed === false).length;
  const avgGpa   = grades.filter(g => g.gradePoint != null).length
    ? (grades.filter(g => g.gradePoint != null)
        .reduce((s, g) => s + g.gradePoint, 0) /
       grades.filter(g => g.gradePoint != null).length).toFixed(2)
    : '—';

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Kết quả học tập theo lớp</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Xem kết quả học tập của sinh viên theo môn học và lớp</p>
      </div>

      {/* Filter */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-subtle whitespace-nowrap">Mã môn (courseId):</label>
          <input value={courseId} onChange={e => setCourseId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="VD: 1" className={`${INPUT} w-28`}/>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-subtle">Lớp:</label>
          <input value={className} onChange={e => setClassName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="VD: 65TH3 (tuỳ chọn)" className={`${INPUT} w-44`}/>
        </div>
        <button onClick={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 font-medium transition-colors">
          <Search size={15}/> Tìm
        </button>
      </div>

      {/* Stats */}
      {grades.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-4"><p className="text-xs text-ink-subtle">Tổng sinh viên</p><p className="text-2xl font-bold text-ink mt-1">{grades.length}</p></div>
          <div className="card p-4"><p className="text-xs text-ink-subtle">GPA trung bình</p><p className={`text-2xl font-bold mt-1 ${gpaColor(Number(avgGpa))}`}>{avgGpa}</p></div>
          <div className="card p-4"><p className="text-xs text-ink-subtle">Đạt</p><p className="text-2xl font-bold text-emerald-600 mt-1">{passed}</p></div>
          <div className="card p-4"><p className="text-xs text-ink-subtle">Không đạt / Chưa có điểm</p><p className="text-2xl font-bold text-rose-500 mt-1">{failed} / {grades.length - passed - failed}</p></div>
        </div>
      )}

      {/* Table — read only, không có inline edit */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : searched && grades.length === 0 ? (
          <EmptyState icon={<GraduationCap size={40} className="text-ink-subtle"/>}
            title="Không có dữ liệu" message="Không tìm thấy sinh viên cho môn và lớp này"/>
        ) : grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
                <tr>
                  {['MSSV','Họ tên','Lớp','Giữa kỳ','Cuối kỳ','BT','Tổng','Loại','GPA','Kết quả'].map((h,i) => (
                    <th key={i} className="px-3 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {grades.map(g => (
                  <tr key={g.enrollmentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-xs text-ink-subtle">{g.studentCode}</td>
                    <td className="px-3 py-2.5 font-medium text-ink">{g.fullName}</td>
                    <td className="px-3 py-2.5 text-xs text-ink-subtle">{g.className}</td>
                    <td className="px-3 py-2.5 text-center">{g.midtermScore ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center">{g.finalScore ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center">{g.assignmentScore ?? '—'}</td>
                    <td className={`px-3 py-2.5 text-center font-semibold ${gpaColor(g.totalScore ? g.totalScore / 2.5 : 0)}`}>
                      {g.totalScore ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      {g.letterGrade
                        ? <Badge variant={gradeVariant(g.letterGrade)}>{g.letterGrade}</Badge>
                        : <span className="text-ink-subtle">—</span>}
                    </td>
                    <td className={`px-3 py-2.5 text-center font-semibold ${gpaColor(g.gradePoint)}`}>
                      {g.gradePoint ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={g.isPassed === true ? 'success' : g.isPassed === false ? 'error' : 'neutral'}>
                        {g.isPassed === true ? 'Đạt' : g.isPassed === false ? 'Trượt' : 'Chưa có'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-subtle text-sm">
            Nhập mã môn và bấm Tìm để xem kết quả
          </div>
        )}
      </div>
    </div>
  );
}