// src/pages/academic/WarningPage.jsx
// lv3+ / advisor : thêm thủ công + import file
// lv5 / admin    : duyệt → ACTIVE trên app, tự EXPIRED sau 6 tháng
import { useState, useEffect, useRef } from 'react';
import { Search, ShieldAlert, Plus, Upload, CheckCircle } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import StatCard   from '../../components/common/StatCard';
import { academicApi } from '../../api/academicApi';
import { uploadImportWarnings } from '../../api/importApi';

function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); } catch { return {}; }
}
function canAdd(role, lv)    { return role === 'ADMIN' || role === 'ADVISOR' || (role === 'STAFF' && lv >= 3); }
function canApprove(role, lv){ return role === 'ADMIN' || (role === 'STAFF' && lv >= 5); }

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full';
const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

const WARNING_TYPE_MAP = {
  LOW_GPA:      { label: 'GPA thấp',           variant: 'error'   },
  FAILED_EXAM:  { label: 'Điểm thi không đạt', variant: 'error'   },
  ATTENDANCE:   { label: 'Vắng mặt quá mức',   variant: 'warning' },
};
function warningType(type) { return WARNING_TYPE_MAP[type] ?? { label: type ?? 'Khác', variant: 'neutral' }; }
function statusVariant(status) {
  if (status === 'ACTIVE')   return 'error';
  if (status === 'RESOLVED' || status === 'resolved') return 'success';
  if (status === 'EXPIRED')  return 'neutral';
  if (status === 'pending')  return 'warning';
  return 'neutral';
}
function statusLabel(status) {
  if (status === 'ACTIVE')   return 'Đang hiệu lực';
  if (status === 'RESOLVED' || status === 'resolved') return 'Đã giải quyết';
  if (status === 'EXPIRED')  return 'Hết hiệu lực';
  if (status === 'pending')  return 'Chờ duyệt';
  return status ?? '—';
}

// ── Form thêm thủ công ────────────────────────────────────────────────
function AddWarningForm({ onDone }) {
  const [form, setForm] = useState({ userId: '', semesterId: '', warningType: 'LOW_GPA', description: '' });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit() {
    if (!form.userId || !form.semesterId) return alert('Nhập đủ User ID và Semester ID');
    setSaving(true);
    try {
      await academicApi.upsertWarning({
        userId: Number(form.userId),
        semesterId: Number(form.semesterId),
        warningType: form.warningType,
        description: form.description || null,
        status: 'pending',
      });
      setForm({ userId: '', semesterId: '', warningType: 'LOW_GPA', description: '' });
      onDone();
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
    finally { setSaving(false); }
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-sm font-medium text-ink">Thêm cảnh báo thủ công</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">User ID sinh viên *</label>
          <input value={form.userId} onChange={e => set('userId', e.target.value)} placeholder="VD: 1001" className={INPUT}/>
        </div>
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">Semester ID *</label>
          <input value={form.semesterId} onChange={e => set('semesterId', e.target.value)} placeholder="VD: 10" className={INPUT}/>
        </div>
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">Loại cảnh báo</label>
          <select value={form.warningType} onChange={e => set('warningType', e.target.value)} className={`${SELECT} w-full`}>
            <option value="LOW_GPA">GPA thấp</option>
            <option value="FAILED_EXAM">Điểm thi không đạt</option>
            <option value="ATTENDANCE">Vắng mặt quá mức</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">Mô tả</label>
          <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Tuỳ chọn" className={INPUT}/>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium transition-colors">
          <Plus size={14}/> {saving ? 'Đang lưu...' : 'Thêm cảnh báo'}
        </button>
      </div>
    </div>
  );
}

// ── Import file ───────────────────────────────────────────────────────
function ImportWarningSection({ onDone }) {
  const fileRef = useRef();
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]     = useState(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true); setResult(null);
    try {
      const res = await uploadImportWarnings(file, true);
      setResult(res); setFile(null); onDone();
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
    finally { setUploading(false); }
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-sm font-medium text-ink">Import file cảnh báo</p>
      <p className="text-xs text-ink-subtle">
        File Excel/CSV, header ở dòng 1. Cột bắt buộc: <code className="bg-slate-100 px-1 rounded">student_code</code>, <code className="bg-slate-100 px-1 rounded">warning_type</code>, <code className="bg-slate-100 px-1 rounded">semester_id</code>. Tuỳ chọn: <code className="bg-slate-100 px-1 rounded">description</code>
      </p>
      <div className="flex items-center gap-3">
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={e => setFile(e.target.files?.[0] ?? null)}/>
        <button onClick={() => fileRef.current?.click()}
          className="px-3 py-2 border border-surface-border rounded-lg text-sm text-ink-subtle hover:bg-slate-50 transition-colors">
          {file ? file.name : 'Chọn file...'}
        </button>
        {file && (
          <button onClick={handleUpload} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors">
            <Upload size={14}/> {uploading ? 'Đang tải...' : 'Tải lên'}
          </button>
        )}
      </div>
      {result && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          ✓ Thành công: {result.success} dòng{result.failed > 0 ? ` | Lỗi: ${result.failed} dòng` : ''}
        </div>
      )}
    </div>
  );
}

// ── Bảng chờ duyệt (lv5+) ─────────────────────────────────────────────
function PendingApprovalSection({ onRefresh }) {
  const [list, setList]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await academicApi.getPendingWarnings(); setList(res.data?.data ?? []); }
    catch { setList([]); } finally { setLoading(false); }
  }

  async function handleApprove(warningId) {
    try { await academicApi.approveWarning(warningId); load(); onRefresh(); }
    catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  const TYPE_LABEL = { LOW_GPA: 'GPA thấp', FAILED_EXAM: 'Điểm thi không đạt', ATTENDANCE: 'Vắng mặt' };

  if (loading) return <div className="py-4 text-center text-ink-subtle text-sm">Đang tải...</div>;
  if (list.length === 0) return <div className="py-4 text-center text-ink-subtle text-sm">Không có cảnh báo chờ duyệt</div>;

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-rose-50 border-b border-rose-200">
        <p className="text-sm font-medium text-rose-800">Chờ duyệt ({list.length}) — Sau khi duyệt sẽ hiển thị trên App với trạng thái Đang hiệu lực, tự hết hạn sau 6 tháng</p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-ink-subtle text-xs uppercase">
          <tr>{['User ID','Loại','Mô tả','Kỳ','Ngày tạo',''].map(h =>
            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {list.map(w => (
            <tr key={w.warningId} className="hover:bg-slate-50">
              <td className="px-4 py-2.5 font-mono text-xs">{w.warningId}</td>
              <td className="px-4 py-2.5"><Badge variant="warning">{TYPE_LABEL[w.warningType] ?? w.warningType}</Badge></td>
              <td className="px-4 py-2.5 max-w-[200px] truncate text-ink-subtle">{w.description}</td>
              <td className="px-4 py-2.5 text-xs text-ink-subtle">Kỳ {w.semesterId}</td>
              <td className="px-4 py-2.5 text-xs text-ink-subtle">{w.issuedAt?.slice(0,10)}</td>
              <td className="px-4 py-2.5">
                <button onClick={() => handleApprove(w.warningId)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs rounded-lg hover:bg-emerald-200 font-medium transition-colors">
                  <CheckCircle size={12}/> Duyệt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function WarningPage() {
  const { role, staffLevel: lv } = getUser();
  const [input, setInput]           = useState('');
  const [warnings, setWarnings]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searched, setSearched]     = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() { setRefreshKey(k => k + 1); }

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setLoading(true); setSearched(true);
    try { const res = await academicApi.getWarnings(id); setWarnings(res.data?.data ?? []); }
    catch { setWarnings([]); } finally { setLoading(false); }
  }

  const filtered = filterStatus ? warnings.filter(w => w.status === filterStatus) : warnings;
  const activeCount   = warnings.filter(w => w.status === 'ACTIVE').length;
  const resolvedCount = warnings.filter(w => w.status === 'RESOLVED' || w.status === 'resolved').length;

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Cảnh báo học vụ</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Quản lý cảnh báo học vụ sinh viên</p>
      </div>

      {/* Thêm/import — lv3+ và advisor */}
      {canAdd(role, lv) && (
        <div className="space-y-3">
          <AddWarningForm onDone={refresh}/>
          <ImportWarningSection onDone={refresh}/>
        </div>
      )}

      {/* Duyệt — lv5+ */}
      {canApprove(role, lv) && <PendingApprovalSection key={refreshKey} onRefresh={refresh}/>}

      {/* Tra cứu */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <Search size={16} className="text-ink-subtle flex-shrink-0"/>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID sinh viên để tra cứu..."
          className={`${INPUT} max-w-64`}/>
        <button onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium whitespace-nowrap">
          Tra cứu
        </button>
        {warnings.length > 0 && (
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={SELECT}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hiệu lực</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="EXPIRED">Hết hiệu lực</option>
          </select>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<ShieldAlert size={20}/>} value={warnings.length} label="Tổng cảnh báo"/>
          <StatCard icon={<ShieldAlert size={20}/>} iconBg="bg-rose-50" iconColor="text-rose-600"
            value={activeCount} label="Đang hiệu lực" index={1}/>
          <StatCard icon={<ShieldAlert size={20}/>} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            value={resolvedCount} label="Đã giải quyết" index={2}/>
        </div>
      )}

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
              <tr>{['Loại cảnh báo','Mô tả','Kỳ học','Ngày phát','Trạng thái'].map(h =>
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filtered.map(w => {
                const wt = warningType(w.warningType);
                return (
                  <tr key={w.warningId} className={`transition-colors ${w.status === 'ACTIVE' ? 'bg-rose-50/30' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3"><Badge variant={wt.variant}>{wt.label}</Badge></td>
                    <td className="px-4 py-3 text-ink max-w-[260px]">{w.description ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-subtle text-xs">Kỳ {w.semesterId}</td>
                    <td className="px-4 py-3 text-ink-subtle text-xs">{w.issuedAt ? w.issuedAt.slice(0,10) : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge></td>
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