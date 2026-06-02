// src/pages/academic/AdvisorScholarshipPage.jsx
// Cố vấn học tập (ADVISOR): cập nhật trạng thái học bổng cho sinh viên
import { useState } from 'react';
import { Search, Award } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';
import { vnd } from '../../utils/formatters';

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const SELECT = `${INPUT} cursor-pointer`;

function statusVariant(s) {
  if (s === 'received')     return 'success';
  if (s === 'not_received') return 'neutral';
  return 'neutral';
}
function statusLabel(s) {
  if (s === 'received')     return 'Đã nhận';
  if (s === 'not_received') return 'Chưa nhận';
  return 'Chưa xét';
}

export default function AdvisorScholarshipPage() {
  const [input,        setInput]        = useState('');
  const [userId,       setUserId]       = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [searched,     setSearched]     = useState(false);
  const [saving,       setSaving]       = useState(null); // scholarshipId đang save

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setUserId(id); setLoading(true); setSearched(true);
    try {
      const res = await academicApi.getScholarships(id);
      setScholarships(res.data?.data ?? []);
    } catch { setScholarships([]); }
    finally { setLoading(false); }
  }

  async function handleStatusChange(s, newStatus) {
    setSaving(s.scholarshipId);
    try {
      const res = await academicApi.updateScholarshipStatus({
        userId:       Number(userId),
        scholarshipId: s.scholarshipId,
        status:        newStatus,
        receivedAt:    newStatus === 'received' ? new Date().toISOString().slice(0, 10) : null,
      });
      const updated = res.data?.data;
      if (updated) {
        setScholarships(prev => prev.map(sc =>
          sc.scholarshipId === updated.scholarshipId ? updated : sc
        ));
      }
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.message ?? e.message));
    } finally { setSaving(null); }
  }

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Quản lý học bổng</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Cố vấn học tập cập nhật trạng thái học bổng cho sinh viên</p>
      </div>

      {/* Search */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-ink-subtle flex-shrink-0"/>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID sinh viên..." className={`${INPUT} w-64`}/>
        <button onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 font-medium transition-colors">
          Tra cứu
        </button>
      </div>

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
                {['Tên học bổng','Tổ chức','Trị giá','GPA tối thiểu','Trạng thái','Ngày nhận','Thay đổi'].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
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
                  <td className="px-4 py-3"><Badge variant={statusVariant(s.status)}>{statusLabel(s.status)}</Badge></td>
                  <td className="px-4 py-3 text-ink-subtle text-xs">{s.receivedAt?.slice(0, 10) ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={s.status ?? ''}
                      disabled={saving === s.scholarshipId}
                      onChange={e => handleStatusChange(s, e.target.value)}
                      className={`${SELECT} text-xs py-1 px-2 ${saving === s.scholarshipId ? 'opacity-50' : ''}`}>
                      <option value="not_received">Chưa nhận</option>
                      <option value="received">Đã nhận</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-subtle text-sm">
            Nhập User ID sinh viên để tra cứu
          </div>
        )}
      </div>
    </div>
  );
}