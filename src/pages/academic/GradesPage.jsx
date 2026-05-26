// src/pages/academic/GradesPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import StatCard   from '../../components/common/StatCard';
import { academicApi } from '../../api/academicApi';
import { gpaColor } from '../../utils/formatters';

function gradeVariant(letter) {
  if (!letter) return 'neutral';
  if (['A', 'A+'].includes(letter))       return 'success';
  if (['B+', 'B'].includes(letter))       return 'info';
  if (['C+', 'C'].includes(letter))       return 'warning';
  return 'error';
}

export default function GradesPage() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const userId     = params.get('userId')     ?? '';
  const semesterId = params.get('semesterId') ?? '';
  const semName    = params.get('semesterName') ? decodeURIComponent(params.get('semesterName')) : 'Tất cả kỳ';

  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    academicApi.getGrades(userId, semesterId || undefined)
      .then(res => setGrades(res.data?.data ?? []))
      .catch(() => setGrades([]))
      .finally(() => setLoading(false));
  }, [userId, semesterId]);

  const totalCredits  = grades.reduce((s, g) => s + (g.credits  ?? 0), 0);
  const passedCredits = grades.filter(g => g.isPassed).reduce((s, g) => s + (g.credits ?? 0), 0);
  const avgGpa = grades.filter(g => g.gradePoint != null).length
    ? (grades.filter(g => g.gradePoint != null).reduce((s, g) => s + g.gradePoint, 0) / grades.filter(g => g.gradePoint != null).length).toFixed(2)
    : '—';

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(grades.map(g => ({
      'Mã môn': g.courseCode, 'Tên môn': g.courseName, 'TC': g.credits,
      'Giữa kỳ': g.midtermScore, 'Cuối kỳ': g.finalScore, 'BT': g.assignmentScore,
      'Tổng': g.totalScore, 'Xếp loại': g.letterGrade, 'Điểm GPA': g.gradePoint,
      'Đạt': g.isPassed ? 'Đạt' : 'Không đạt', 'Kỳ học': g.semesterName,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm');
    XLSX.writeFile(wb, `diem-${userId}-${semesterId || 'all'}.xlsx`);
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-surface-hover text-ink-subtle">
          <ArrowLeft size={18}/>
        </button>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">Xem điểm</h1>
          <p className="text-sm text-ink-subtle">{semName} · User ID: {userId}</p>
        </div>
        <div className="ml-auto">
          <button onClick={handleExport} disabled={grades.length === 0}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-surface-border rounded-lg hover:bg-surface-hover disabled:opacity-40 transition-colors">
            <Download size={15}/> Export
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {grades.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<ClipboardList size={20}/>} value={grades.length}   label="Số môn học"    />
          <StatCard icon={<ClipboardList size={20}/>} iconBg="bg-emerald-50" iconColor="text-emerald-600" value={`${passedCredits}/${totalCredits}`} label="Tín chỉ đạt" index={1}/>
          <StatCard icon={<ClipboardList size={20}/>} iconBg="bg-amber-50"   iconColor="text-amber-600"   value={avgGpa} label="Điểm GPA TB" index={2}/>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : grades.length === 0 ? (
          <EmptyState icon={<ClipboardList size={40} className="text-ink-subtle"/>} title="Không có dữ liệu điểm" message="Sinh viên chưa có điểm trong kỳ này"/>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
                <tr>
                  {['Mã môn','Tên môn','TC','Giữa kỳ','Cuối kỳ','BT','Tổng','Loại','GPA','Đạt','Kỳ học'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {grades.map(g => (
                  <tr key={g.enrollmentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{g.courseCode}</td>
                    <td className="px-4 py-3 font-medium text-ink max-w-[200px] truncate">{g.courseName}</td>
                    <td className="px-4 py-3 text-center">{g.credits}</td>
                    <td className="px-4 py-3 text-center">{g.midtermScore ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{g.finalScore ?? '—'}</td>
                    <td className="px-4 py-3 text-center">{g.assignmentScore ?? '—'}</td>
                    <td className={`px-4 py-3 text-center font-semibold ${gpaColor(g.totalScore ? g.totalScore / 2.5 : 0)}`}>
                      {g.totalScore ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {g.letterGrade
                        ? <Badge variant={gradeVariant(g.letterGrade)}>{g.letterGrade}</Badge>
                        : <span className="text-ink-subtle">—</span>}
                    </td>
                    <td className={`px-4 py-3 text-center font-semibold ${gpaColor(g.gradePoint)}`}>
                      {g.gradePoint ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={g.isPassed ? 'success' : g.isPassed === false ? 'error' : 'neutral'}>
                        {g.isPassed === true ? 'Đạt' : g.isPassed === false ? 'Trượt' : 'Đang học'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-subtle text-xs whitespace-nowrap">{g.semesterName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
