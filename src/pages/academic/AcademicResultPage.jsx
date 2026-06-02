// src/pages/academic/AcademicResultPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, GraduationCap, BookOpen, Award, TrendingUp } from 'lucide-react';
import StatCard   from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';
import { gpaColor } from '../../utils/formatters';

const INPUT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-64';

export default function AcademicResultPage() {
  const navigate = useNavigate();
  const [input,    setInput]    = useState('');
  const [userId,   setUserId]   = useState('');
  const [semesters,setSemesters]= useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setLoading(true); setSearched(true); setUserId(id);
    try {
      const res = await academicApi.getSemesters(id);
      setSemesters(res.data?.data ?? []);
    } catch { setSemesters([]); }
    finally   { setLoading(false); }
  }

  const totalCredits  = semesters.reduce((s, k) => s + (k.totalCredits  ?? 0), 0);
  const passedCredits = semesters.reduce((s, k) => s + (k.passedCredits ?? 0), 0);
  const avgGpa = semesters.length
    ? (semesters.reduce((s, k) => s + (k.gpa ?? 0), 0) / semesters.length).toFixed(2) : '—';
  const bestGpa = semesters.length
    ? Math.max(...semesters.map(k => k.gpa ?? 0)).toFixed(2) : '—';

  // Lấy tên + MSSV từ kỳ đầu tiên (tất cả kỳ cùng 1 sinh viên)
  const studentName = semesters[0]?.fullName    ?? null;
  const studentCode = semesters[0]?.studentCode ?? null;

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Kết quả học tập</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Tra cứu kết quả học tập theo từng sinh viên</p>
      </div>

      {/* Search */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-ink-subtle flex-shrink-0"/>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID sinh viên..." className={INPUT}/>
        <button onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium">
          Tra cứu
        </button>
      </div>

      {semesters.length > 0 && (
        <>
          {/* Thông tin sinh viên */}
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-brand-700 text-lg">
                {studentName ? studentName.split(' ').map(w=>w[0]).slice(-2).join('').toUpperCase() : '?'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-ink text-base">{studentName ?? '—'}</p>
              <p className="text-sm text-ink-subtle">
                {studentCode ? `MSSV: ${studentCode}` : `User ID: ${userId}`}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<TrendingUp size={20}/>}   value={avgGpa}        label="GPA trung bình"/>
            <StatCard icon={<Award size={20}/>}         iconBg="bg-amber-50"   iconColor="text-amber-600"   value={bestGpa}       label="GPA cao nhất"  index={1}/>
            <StatCard icon={<BookOpen size={20}/>}      iconBg="bg-emerald-50" iconColor="text-emerald-600" value={totalCredits}  label="Tổng tín chỉ" index={2}/>
            <StatCard icon={<GraduationCap size={20}/>} iconBg="bg-sky-50"     iconColor="text-sky-600"     value={passedCredits} label="Tín chỉ đạt"  index={3}/>
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
                        className="text-brand-600 hover:underline text-xs font-medium">
                        Xem & nhập điểm
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      )}

      {searched && !loading && semesters.length === 0 && (
        <div className="card">
          <EmptyState icon={<GraduationCap size={40} className="text-ink-subtle"/>}
            title="Không tìm thấy dữ liệu"
            message="Sinh viên chưa có dữ liệu học tập hoặc User ID không đúng"/>
        </div>
      )}
    </div>
  );
}
