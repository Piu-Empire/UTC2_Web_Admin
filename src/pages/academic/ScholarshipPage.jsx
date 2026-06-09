// src/pages/academic/ScholarshipPage.jsx
// lv3+ / advisor : thêm thủ công + import file
// lv5 / admin    : duyệt (pending→not_received trên app) + đánh dấu đã nhận
import { useState, useEffect, useRef } from 'react';
import { Search, Award, Plus, Upload, CheckCircle, X } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import StatCard   from '../../components/common/StatCard';
import { academicApi } from '../../api/academicApi';
import { uploadImportScholarships } from '../../api/importApi';
import { vnd } from '../../utils/formatters';

function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); } catch { return {}; }
}
function canAdd(role, lv)    { return role === 'ADMIN' || role === 'ADVISOR' || (role === 'STAFF' && lv >= 3); }
function canApprove(role, lv){ return role === 'ADMIN' || (role === 'STAFF' && lv >= 5); }

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full';
const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

function scholarshipVariant(status) {
  if (status === 'received')     return 'success';
  if (status === 'not_received' || status === 'approved') return 'neutral';
  if (status === 'pending')      return 'warning';
  return 'neutral';
}
function scholarshipLabel(status) {
  if (status === 'received')     return 'Đã nhận';
  if (status === 'approved' || status === 'not_received') return 'Chưa nhận';
  if (status === 'pending')      return 'Chờ duyệt';
  return 'Chưa xét';
}

// ── Form thêm thủ công ────────────────────────────────────────────────
function AddScholarshipForm({ onDone }) {
  const [form, setForm] = useState({ userId: '', scholarshipId: '', semesterId: '' });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit() {
    if (!form.userId || !form.scholarshipId) return alert('Nhập đủ User ID và Scholarship ID');
    setSaving(true);
    try {
      await academicApi.upsertScholarship({
        userId: Number(form.userId),
        scholarshipId: Number(form.scholarshipId),
        semesterId: form.semesterId ? Number(form.semesterId) : null,
        status: 'pending',
      });
      setForm({ userId: '', scholarshipId: '', semesterId: '' });
      onDone();
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
    finally { setSaving(false); }
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-sm font-medium text-ink">Thêm học bổng thủ công</p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">User ID sinh viên *</label>
          <input value={form.userId} onChange={e => set('userId', e.target.value)} placeholder="VD: 1001" className={INPUT}/>
        </div>
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">Scholarship ID *</label>
          <input value={form.scholarshipId} onChange={e => set('scholarshipId', e.target.value)} placeholder="VD: 5" className={INPUT}/>
        </div>
        <div>
          <label className="text-xs text-ink-subtle mb-1 block">Semester ID</label>
          <input value={form.semesterId} onChange={e => set('semesterId', e.target.value)} placeholder="Tùy chọn" className={INPUT}/>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium transition-colors">
          <Plus size={14}/> {saving ? 'Đang lưu...' : 'Thêm học bổng'}
        </button>
      </div>
    </div>
  );
}

// ── Import file ───────────────────────────────────────────────────────
function ImportScholarshipSection({ onDone }) {
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const res = await uploadImportScholarships(file, true);
      setResult(res);
      setFile(null);
      onDone();
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
    finally { setUploading(false); }
  }

  return (
    <div className="card p-4 space-y-3">
      <p className="text-sm font-medium text-ink">Import file học bổng</p>
      <p className="text-xs text-ink-subtle">
        File Excel/CSV, header ở dòng 1. Cột bắt buộc: <code className="bg-slate-100 px-1 rounded">student_code</code>, <code className="bg-slate-100 px-1 rounded">scholarship_name</code>. Tuỳ chọn: <code className="bg-slate-100 px-1 rounded">semester_id</code>
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
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await academicApi.getPendingScholarships(); setList(res.data?.data ?? []); }
    catch { setList([]); } finally { setLoading(false); }
  }

  async function handleApprove(userId, schId) {
    try { await academicApi.approveScholarship(userId, schId); load(); onRefresh(); }
    catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  async function handleReceived(userId, schId) {
    try { await academicApi.markScholarshipReceived(userId, schId); load(); onRefresh(); }
    catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  if (loading) return <div className="py-4 text-center text-ink-subtle text-sm">Đang tải...</div>;
  if (list.length === 0) return <div className="py-4 text-center text-ink-subtle text-sm">Không có học bổng chờ duyệt</div>;

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
        <p className="text-sm font-medium text-amber-800">Chờ duyệt ({list.length})</p>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-ink-subtle text-xs uppercase">
          <tr>{['MSSV','Họ tên','Học bổng','Trạng thái',''].map(h =>
            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {list.map((s, i) => {
            const userId=s[0], name=s[1], code=s[2], schId=s[3], schName=s[4], status=s[5];
            return (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono text-xs">{code}</td>
                <td className="px-4 py-2.5 font-medium text-ink">{name}</td>
                <td className="px-4 py-2.5 text-ink-subtle">{schName}</td>
                <td className="px-4 py-2.5"><Badge variant={scholarshipVariant(status)}>{scholarshipLabel(status)}</Badge></td>
                <td className="px-4 py-2.5 flex gap-2">
                  {status === 'pending' && (
                    <button onClick={() => handleApprove(userId, schId)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs rounded-lg hover:bg-emerald-200 font-medium transition-colors">
                      <CheckCircle size={12}/> Duyệt
                    </button>
                  )}
                  {(status === 'approved' || status === 'not_received') && (
                    <button onClick={() => handleReceived(userId, schId)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 text-xs rounded-lg hover:bg-brand-200 font-medium transition-colors">
                      <CheckCircle size={12}/> Đã nhận
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function ScholarshipPage() {
  const { role, staffLevel: lv } = getUser();
  const [input, setInput]             = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [refreshKey, setRefreshKey]   = useState(0);

  function refresh() { setRefreshKey(k => k + 1); }

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setLoading(true); setSearched(true);
    try { const res = await academicApi.getScholarships(id); setScholarships(res.data?.data ?? []); }
    catch { setScholarships([]); } finally { setLoading(false); }
  }

  const received    = scholarships.filter(s => s.status === 'received');
  const totalAmount = received.reduce((sum, s) => sum + (s.amount ?? 0), 0);

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Học bổng</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Quản lý học bổng sinh viên</p>
      </div>

      {/* Thêm/import — lv3+ và advisor */}
      {canAdd(role, lv) && (
        <div className="space-y-3">
          <AddScholarshipForm onDone={refresh}/>
          <ImportScholarshipSection onDone={refresh}/>
        </div>
      )}

      {/* Duyệt — lv5+ */}
      {canApprove(role, lv) && <PendingApprovalSection key={refreshKey} onRefresh={refresh}/>}

      {/* Tra cứu */}
      <div className="card p-4 flex items-center gap-3">
        <Search size={16} className="text-ink-subtle flex-shrink-0"/>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Nhập User ID sinh viên để tra cứu..." className={`${INPUT} max-w-64`}/>
        <button onClick={handleSearch}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 transition-colors font-medium whitespace-nowrap">
          Tra cứu
        </button>
      </div>

      {scholarships.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={<Award size={20}/>} value={scholarships.length} label="Tổng học bổng"/>
          <StatCard icon={<Award size={20}/>} iconBg="bg-emerald-50" iconColor="text-emerald-600"
            value={received.length} label="Đã nhận" index={1}/>
          <StatCard icon={<Award size={20}/>} iconBg="bg-amber-50" iconColor="text-amber-600"
            value={vnd(totalAmount)} label="Tổng tiền đã nhận" index={2}/>
        </div>
      )}

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
              <tr>{['Tên học bổng','Tổ chức','Trị giá','GPA tối thiểu','Mô tả','Trạng thái','Ngày nhận'].map(h =>
                <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>)}
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
                  <td className="px-4 py-3"><Badge variant={scholarshipVariant(s.status)}>{scholarshipLabel(s.status)}</Badge></td>
                  <td className="px-4 py-3 text-ink-subtle text-xs">{s.receivedAt ? s.receivedAt.slice(0,10) : '—'}</td>
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