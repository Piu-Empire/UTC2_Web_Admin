// src/pages/academic/AcademicResultPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, BookOpen, Award, TrendingUp } from 'lucide-react';
import StatCard   from '../../components/common/StatCard';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';
import { gpaColor } from '../../utils/formatters';

const INPUT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-64';

export default function AcademicResultPage() {
  const navigate = useNavigate();
  const [userId, setUserId]     = useState('');
  const [input,  setInput]      = useState('');
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setLoading(true);
    setSearched(true);
    setUserId(id);
    try {
      const res = await academicApi.getSemesters(id);
      setSemesters(res.data?.data ?? []);
    } catch {
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  }

  // Tính tổng từ tất cả kỳ
  const totalCredits  = semesters.reduce((s, k) => s + (k.totalCredits  ?? 0), 0);
  const passedCredits = semesters.reduce((s, k) => s + (k.passedCredits ?? 0), 0);
  const avgGpa = semesters.length
    ? (semesters.reduce((s, k) => s + (k.gpa ?? 0), 0) / semesters.length).toFixed(2)
    : '—';
  const bestGpa = semesters.length
    ? Math.max(...semesters.map(k => k.gpa ?? 0)).toFixed(2)
    : '—';

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Kết quả học tập</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Tra cứu kết quả học tập theo từng sinh viên</p>
      </div>

      {/* Search bar */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-ink-subtle flex-shrink-0" />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID sinh viên..."
          className={INPUT}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium"
        >
          Tra cứu
        </button>
      </div>

      {/* Stat cards */}
      {semesters.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<TrendingUp size={20}/>}  iconBg="bg-brand-50"   iconColor="text-brand-600"   value={avgGpa}        label="GPA trung bình" />
            <StatCard icon={<Award size={20}/>}        iconBg="bg-amber-50"   iconColor="text-amber-600"   value={bestGpa}       label="GPA cao nhất"   index={1}/>
            <StatCard icon={<BookOpen size={20}/>}     iconBg="bg-emerald-50" iconColor="text-emerald-600" value={totalCredits}  label="Tổng tín chỉ"   index={2}/>
            <StatCard icon={<GraduationCap size={20}/>}iconBg="bg-sky-50"     iconColor="text-sky-600"     value={passedCredits} label="Tín chỉ đạt"    index={3}/>
          </div>

          {/* Bảng kỳ học */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border">
              <h2 className="font-semibold text-ink">Danh sách kỳ học</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
                <tr>
                  {['Kỳ học','Năm học','Tín chỉ','Tín chỉ đạt','GPA','Thời gian','Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {semesters.map(s => (
                  <tr key={s.semesterId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">{s.semesterName}</td>
                    <td className="px-4 py-3 text-ink-subtle">{s.academicYear}</td>
                    <td className="px-4 py-3">{s.totalCredits ?? '—'}</td>
                    <td className="px-4 py-3">{s.passedCredits ?? '—'}</td>
                    <td className={`px-4 py-3 font-semibold ${gpaColor(s.gpa)}`}>
                      {s.gpa != null ? Number(s.gpa).toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-subtle text-xs">
                      {s.startDate?.slice(0,10)} → {s.endDate?.slice(0,10)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/academic/grades?userId=${userId}&semesterId=${s.semesterId}&semesterName=${encodeURIComponent(s.semesterName)}`)}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        Xem điểm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      )}

      {/* Empty */}
      {searched && !loading && semesters.length === 0 && (
        <div className="card">
          <EmptyState
            icon={<GraduationCap size={40} className="text-ink-subtle"/>}
            title="Không tìm thấy dữ liệu"
            message="Sinh viên chưa có dữ liệu học tập hoặc User ID không đúng"
          />
        </div>
      )}
    </div>
  );
}
