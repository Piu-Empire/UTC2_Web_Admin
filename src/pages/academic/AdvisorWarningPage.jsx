// src/pages/academic/AdvisorWarningPage.jsx
// Cố vấn học tập (ADVISOR): thêm/xóa cảnh báo học vụ cho sinh viên
import { useState } from 'react';
import { Search, ShieldAlert, Plus, Trash2, X } from 'lucide-react';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const SELECT = `${INPUT} cursor-pointer`;

const WARNING_TYPES = [
  { value: 'LOW_GPA',     label: 'GPA thấp' },
  { value: 'FAILED_EXAM', label: 'Điểm thi không đạt' },
  { value: 'ATTENDANCE',  label: 'Vắng mặt quá mức' },
];

function statusVariant(s) { return s === 'ACTIVE' ? 'error' : 'success'; }
function statusLabel(s)   { return s === 'ACTIVE' ? 'Đang hiệu lực' : 'Đã giải quyết'; }
function typeLabel(t)     { return WARNING_TYPES.find(w => w.value === t)?.label ?? t; }

// ── Add Warning Modal ──────────────────────────────────────────────────────
function AddWarningModal({ userId, onClose, onAdded }) {
  const [form, setForm] = useState({
    semesterId:  '',
    warningType: 'LOW_GPA',
    description: '',
    status:      'ACTIVE',
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.semesterId || !form.description) {
      alert('Vui lòng điền đầy đủ Kỳ học và Mô tả');
      return;
    }
    setSaving(true);
    try {
      const res = await academicApi.upsertWarning({
        userId:      Number(userId),
        semesterId:  Number(form.semesterId),
        warningType: form.warningType,
        description: form.description,
        status:      form.status,
      });
      onAdded(res.data?.data);
      onClose();
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.message ?? e.message));
    } finally { setSaving(false); }
  }

  const F = ({ label, children }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-ink-subtle">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[460px]">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-ink">Thêm cảnh báo học vụ</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-hover text-ink-subtle"><X size={16}/></button>
        </div>
        <div className="p-6 space-y-4">
          <F label="ID Kỳ học (semesterId) *">
            <input value={form.semesterId} onChange={e => setForm(f => ({ ...f, semesterId: e.target.value }))}
              placeholder="VD: 1" className={`${INPUT} w-full`}/>
          </F>
          <F label="Loại cảnh báo">
            <select value={form.warningType} onChange={e => setForm(f => ({ ...f, warningType: e.target.value }))}
              className={`${SELECT} w-full`}>
              {WARNING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </F>
          <F label="Mô tả *">
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Nhập mô tả chi tiết cảnh báo..."
              className={`${INPUT} w-full resize-none`}/>
          </F>
          <F label="Trạng thái">
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className={`${SELECT} w-full`}>
              <option value="ACTIVE">Đang hiệu lực</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          </F>
        </div>
        <div className="px-6 py-4 border-t border-surface-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-border rounded-lg hover:bg-surface-hover transition-colors">Huỷ</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium transition-colors">
            {saving ? 'Đang lưu...' : 'Lưu cảnh báo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdvisorWarningPage() {
  const [input,    setInput]    = useState('');
  const [userId,   setUserId]   = useState('');
  const [warnings, setWarnings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);

  async function handleSearch() {
    const id = input.trim();
    if (!id) return;
    setUserId(id); setLoading(true); setSearched(true);
    try {
      const res = await academicApi.getWarnings(id);
      setWarnings(res.data?.data ?? []);
    } catch { setWarnings([]); }
    finally { setLoading(false); }
  }

  async function handleDelete(warningId) {
    if (!confirm('Xoá cảnh báo này?')) return;
    try {
      await academicApi.deleteWarning(warningId);
      setWarnings(prev => prev.filter(w => w.warningId !== warningId));
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  function handleAdded(w) {
    if (w) setWarnings(prev => [w, ...prev]);
  }

  return (
    <div className="space-y-5 max-w-[1000px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Quản lý cảnh báo học vụ</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Cố vấn học tập thêm/xóa cảnh báo cho sinh viên</p>
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
        {searched && userId && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-brand-300 text-brand-600 rounded-lg hover:bg-brand-50 font-medium transition-colors ml-auto">
            <Plus size={15}/> Thêm cảnh báo
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : searched && warnings.length === 0 ? (
          <EmptyState icon={<ShieldAlert size={40} className="text-ink-subtle"/>}
            title="Không có cảnh báo" message="Sinh viên chưa có cảnh báo học vụ nào"/>
        ) : warnings.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
              <tr>
                {['Loại','Mô tả','Kỳ','Ngày phát','Trạng thái',''].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {warnings.map(w => (
                <tr key={w.warningId} className={`transition-colors ${w.status === 'ACTIVE' ? 'bg-rose-50/30' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3"><Badge variant={w.status === 'ACTIVE' ? 'error' : 'neutral'}>{typeLabel(w.warningType)}</Badge></td>
                  <td className="px-4 py-3 text-ink max-w-[240px]">{w.description}</td>
                  <td className="px-4 py-3 text-xs text-ink-subtle">Kỳ {w.semesterId}</td>
                  <td className="px-4 py-3 text-xs text-ink-subtle">{w.issuedAt?.slice(0, 10)}</td>
                  <td className="px-4 py-3"><Badge variant={statusVariant(w.status)}>{statusLabel(w.status)}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(w.warningId)}
                      className="p-1.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <Trash2 size={14}/>
                    </button>
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

      {showAdd && <AddWarningModal userId={userId} onClose={() => setShowAdd(false)} onAdded={handleAdded}/>}
    </div>
  );
}