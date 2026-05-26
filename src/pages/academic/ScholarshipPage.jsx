// src/pages/academic/ScholarshipPage.jsx
import { useState, useEffect } from 'react';
import { Search, Award } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import StatCard   from '../../components/common/StatCard';
import { academicApi } from '../../api/academicApi';
import { vnd } from '../../utils/formatters';

const INPUT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-64';

function scholarshipVariant(status) {
  if (status === 'received')     return 'success';
  if (status === 'not_received') return 'neutral';
  return 'neutral';
}
function scholarshipLabel(status) {
  if (status === 'received')     return 'Đã nhận';
  if (status === 'not_received') return 'Chưa nhận';
  return 'Chưa xét';
}

export default function ScholarshipPage() {
  const [input,       setInput]       = useState('');
  const [userId,      setUserId]      = useState('');
  const [scholarships,setScholarships]= useState([]);
  const [loading,     setLoading]     = useState(false);
  const [searched,    setSearched]    = useState(false);

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setUserId(id);
    setLoading(true);
    setSearched(true);
    try {
      const res = await academicApi.getScholarships(id);
      setScholarships(res.data?.data ?? []);
    } catch {
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  }

  const received    = scholarships.filter(s => s.status === 'received');
  const totalAmount = received.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  return (
    <div className="space-y-5 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Học bổng</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Tra cứu học bổng theo sinh viên</p>
      </div>

      {/* Search */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-ink-subtle flex-shrink-0"/>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID sinh viên..."
          className={INPUT}
        />
        <button onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium">
          Tra cứu
        </button>
      </div>

      {/* Stats */}
      {scholarships.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<Award size={20}/>} value={scholarships.length} label="Tổng học bổng"/>
          <StatCard icon={<Award size={20}/>} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            value={received.length} label="Đã nhận" index={1}/>
          <StatCard icon={<Award size={20}/>} iconBg="bg-amber-50" iconColor="text-amber-600"
            value={vnd(totalAmount)} label="Tổng tiền đã nhận" index={2}/>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : searched && scholarships.length === 0 ? (
          <EmptyState icon={<Award size={40} className="text-ink-subtle"/>}
            title="Không có dữ liệu" message="Sinh viên chưa có thông tin học bổng hoặc User ID không đúng"/>
        ) : scholarships.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
              <tr>
                {['Tên học bổng','Tổ chức','Trị giá','GPA tối thiểu','Mô tả','Trạng thái','Ngày nhận'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {scholarships.map(s => (
                <tr key={s.scholarshipId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-ink-subtle">{s.organization ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{s.amount ? vnd(s.amount) : '—'}</td>
                  <td className="px-4 py-3 text-center">{s.minGpa != null ? Number(s.minGpa).toFixed(1) : '—'}</td>
                  <td className="px-4 py-3 text-ink-subtle max-w-[200px] truncate">{s.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={scholarshipVariant(s.status)}>{scholarshipLabel(s.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-subtle text-xs">
                    {s.receivedAt ? s.receivedAt.slice(0,10) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-subtle text-sm">
            Nhập User ID để tra cứu học bổng
          </div>
        )}
      </div>
    </div>
  );
}
