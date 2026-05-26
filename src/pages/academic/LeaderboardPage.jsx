// src/pages/academic/LeaderboardPage.jsx
import { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';
import { gpaColor } from '../../utils/formatters';

const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const YEARS  = ['2025-2026','2024-2025','2023-2024','2022-2023','2021-2022'];

function RankIcon({ rank }) {
  if (rank === 1) return <Trophy  size={18} className="text-amber-500"/>;
  if (rank === 2) return <Medal   size={18} className="text-slate-400"/>;
  if (rank === 3) return <Medal   size={18} className="text-amber-700"/>;
  return <span className="text-sm text-ink-subtle font-mono w-[18px] text-center">{rank}</span>;
}

export default function LeaderboardPage() {
  const [academicYear, setAcademicYear] = useState(YEARS[0]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    academicApi.getLeaderboard(undefined, academicYear)
      .then(res => setEntries(res.data?.data ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [academicYear]);

  const top3 = entries.slice(0, 3);

  return (
    <div className="space-y-5 max-w-[900px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-xl text-ink">Bảng xếp hạng</h1>
          <p className="text-sm text-ink-subtle mt-0.5">Xếp hạng GPA theo năm học</p>
        </div>
        <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className={SELECT}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Top 3 podium */}
      {top3.length === 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[top3[1], top3[0], top3[2]].map((e, idx) => {
            const podiumOrder = [2, 1, 3];
            const colors = ['bg-slate-100 border-slate-300', 'bg-amber-50 border-amber-300', 'bg-amber-50/50 border-amber-200'];
            return (
              <div key={e.studentCode} className={`card border-2 ${colors[idx]} p-4 flex flex-col items-center gap-2`}>
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="font-bold text-brand-700">{e.initials}</span>
                </div>
                <RankIcon rank={podiumOrder[idx]}/>
                <p className="font-semibold text-ink text-sm text-center leading-tight">{e.fullName}</p>
                <p className="text-xs text-ink-subtle">{e.studentCode}</p>
                <p className={`text-lg font-bold ${gpaColor(e.gpa)}`}>{Number(e.gpa).toFixed(2)}</p>
                <p className="text-xs text-ink-subtle">{e.totalCredits} TC</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : entries.length === 0 ? (
          <EmptyState icon={<Trophy size={40} className="text-ink-subtle"/>} title="Chưa có dữ liệu" message="Không có dữ liệu xếp hạng cho năm học này"/>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
              <tr>
                {['Hạng','Sinh viên','MSSV','Tín chỉ','GPA'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {entries.map(e => (
                <tr key={e.studentCode}
                  className={`transition-colors ${e.isCurrentUser ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center w-6"><RankIcon rank={e.rank}/></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-brand-700">{e.initials}</span>
                      </div>
                      <span className="font-medium text-ink">{e.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{e.studentCode}</td>
                  <td className="px-4 py-3">{e.totalCredits}</td>
                  <td className={`px-4 py-3 font-bold text-base ${gpaColor(e.gpa)}`}>
                    {Number(e.gpa).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
