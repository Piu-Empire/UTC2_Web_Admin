// src/pages/academic/WarningPage.jsx
import { useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import StatCard   from '../../components/common/StatCard';
import { academicApi } from '../../api/academicApi';

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-64';
const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

const WARNING_TYPE_MAP = {
  LOW_GPA:      { label: 'GPA thấp',           variant: 'error'   },
  FAILED_EXAM:  { label: 'Điểm thi không đạt', variant: 'error'   },
  ATTENDANCE:   { label: 'Vắng mặt quá mức',   variant: 'warning' },
};

function warningType(type) {
  return WARNING_TYPE_MAP[type] ?? { label: type ?? 'Khác', variant: 'neutral' };
}

function statusVariant(status) {
  if (status === 'ACTIVE')   return 'error';
  if (status === 'RESOLVED') return 'success';
  return 'neutral';
}
function statusLabel(status) {
  if (status === 'ACTIVE')   return 'Đang hiệu lực';
  if (status === 'RESOLVED') return 'Đã giải quyết';
  return status ?? '—';
}

export default function WarningPage() {
  const [input,    setInput]    = useState('');
  const [userId,   setUserId]   = useState('');
  const [warnings, setWarnings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setUserId(id);
    setLoading(true);
    setSearched(true);
    try {
      const res = await academicApi.getWarnings(id);
      setWarnings(res.data?.data ?? []);
    } catch {
      setWarnings([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = filterStatus
    ? warnings.filter(w => w.status === filterStatus)
    : warnings;

  const activeCount   = warnings.filter(w => w.status === 'ACTIVE').length;
  const resolvedCount = warnings.filter(w => w.status === 'RESOLVED').length;

  return (
    <div className="space-y-5 max-w-[1100px]">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Cảnh báo học vụ</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Tra cứu cảnh báo học vụ theo sinh viên</p>
      </div>

      {/* Search */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
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
        {warnings.length > 0 && (
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SELECT}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hiệu lực</option>
            <option value="RESOLVED">Đã giải quyết</option>
          </select>
        )}
      </div>

      {/* Stats */}
      {warnings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<ShieldAlert size={20}/>} value={warnings.length} label="Tổng cảnh báo"/>
          <StatCard icon={<ShieldAlert size={20}/>} iconBg="bg-rose-50" iconColor="text-rose-600"
            value={activeCount} label="Đang hiệu lực" index={1}/>
          <StatCard icon={<ShieldAlert size={20}/>} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            value={resolvedCount} label="Đã giải quyết" index={2}/>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : searched && warnings.length === 0 ? (
          <EmptyState icon={<ShieldAlert size={40} className="text-ink-subtle"/>}
            title="Không có cảnh báo" message="Sinh viên không có cảnh báo học vụ nào hoặc User ID không đúng"/>
        ) : filtered.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
              <tr>
                {['Loại cảnh báo','Mô tả','Kỳ học','Ngày phát','Ngày giải quyết','Trạng thái'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map(w => {
                const wt = warningType(w.warningType);
                return (
                  <tr key={w.warningId} className={`transition-colors ${w.status === 'ACTIVE' ? 'bg-rose-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <Badge variant={wt.variant}>{wt.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink max-w-[260px]">{w.description ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-subtle text-xs">Kỳ {w.semesterId}</td>
                    <td className="px-4 py-3 text-ink-subtle text-xs">
                      {w.issuedAt ? w.issuedAt.slice(0,10) : '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-subtle text-xs">
                      {w.resolvedAt ? w.resolvedAt.slice(0,10) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-subtle text-sm">
            {searched ? 'Không có cảnh báo phù hợp với bộ lọc' : 'Nhập User ID để tra cứu cảnh báo học vụ'}
          </div>
        )}
      </div>
    </div>
  );
}
