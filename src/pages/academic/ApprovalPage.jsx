// src/pages/academic/ApprovalPage.jsx
// Staff lv5 + Admin: duyệt leaderboard, warning, scholarship
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Trophy, ShieldAlert, Award, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import { academicApi } from '../../api/academicApi';

const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer';
const YEARS  = ['2025-2026','2024-2025','2023-2024'];

// ── Tab: Bảng xếp hạng ────────────────────────────────────────────────
function LeaderboardTab() {
  const [semesters,  setSemesters]  = useState([]);
  const [semesterId, setSemesterId] = useState('');
  const [preview,    setPreview]    = useState([]);
  const [approved,   setApproved]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);

  async function loadPreview() {
    if (!semesterId) return;
    setLoading(true);
    try {
      const res = await academicApi.getPendingLeaderboard(Number(semesterId));
      setPreview(res.data?.data ?? []);
    } catch { setPreview([]); }
    finally { setLoading(false); }
  }

  async function handleApprove() {
    setSaving(true);
    try {
      await academicApi.approveLeaderboard(Number(semesterId));
      setApproved(true);
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
    finally { setSaving(false); }
  }

  async function handleRevoke() {
    setSaving(true);
    try {
      await academicApi.revokeLeaderboard(Number(semesterId));
      setApproved(false);
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input value={semesterId} onChange={e => setSemesterId(e.target.value)}
          placeholder="Semester ID" className={`${SELECT} w-40`}/>
        <button onClick={loadPreview} disabled={!semesterId || loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium transition-colors">
          <RefreshCw size={14}/> Xem trước
        </button>
        {preview.length > 0 && !approved && (
          <button onClick={handleApprove} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors ml-auto">
            <CheckCircle size={14}/> Duyệt bảng xếp hạng kỳ {semesterId}
          </button>
        )}
        {approved && (
          <button onClick={handleRevoke} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600 disabled:opacity-50 font-medium transition-colors ml-auto">
            <XCircle size={14}/> Huỷ duyệt
          </button>
        )}
      </div>

      {approved && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-medium">✓ Bảng xếp hạng kỳ {semesterId} đã được duyệt — hiển thị trên App</div>}

      {preview.length > 0 && (
        <table className="w-full text-sm border border-surface-border rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-xs uppercase text-ink-subtle">
            <tr>{['Hạng','MSSV','Họ tên','GPA','Tín chỉ'].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {preview.map(e=>(
              <tr key={e.studentCode} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-bold text-brand-600">#{e.rank}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-ink-subtle">{e.studentCode}</td>
                <td className="px-4 py-2.5 font-medium text-ink">{e.fullName}</td>
                <td className="px-4 py-2.5 font-bold text-emerald-600">{Number(e.gpa).toFixed(2)}</td>
                <td className="px-4 py-2.5">{e.totalCredits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Tab: Cảnh báo học vụ ──────────────────────────────────────────────
function WarningTab() {
  const [list, setList]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await academicApi.getPendingWarnings(); setList(res.data?.data ?? []); }
    catch { setList([]); }
    finally { setLoading(false); }
  }

  async function handleApprove(warningId) {
    try {
      await academicApi.approveWarning(warningId);
      setList(prev => prev.filter(w => w.warningId !== warningId));
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  const TYPE_LABEL = { LOW_GPA: 'GPA thấp', FAILED_EXAM: 'Điểm thi không đạt', ATTENDANCE: 'Vắng mặt' };

  return (
    <div>
      {loading ? <div className="py-8 text-center text-ink-subtle text-sm">Đang tải...</div>
      : list.length === 0 ? <div className="py-8 text-center text-ink-subtle text-sm">Không có cảnh báo chờ duyệt</div>
      : (
        <table className="w-full text-sm border border-surface-border rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-xs uppercase text-ink-subtle">
            <tr>{['User ID','Loại','Mô tả','Kỳ','Ngày tạo',''].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {list.map(w=>(
              <tr key={w.warningId} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono text-xs">{w.warningId}</td>
                <td className="px-4 py-2.5"><Badge variant="warning">{TYPE_LABEL[w.warningType]??w.warningType}</Badge></td>
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
      )}
    </div>
  );
}

// ── Tab: Học bổng ─────────────────────────────────────────────────────
function ScholarshipTab() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { const res = await academicApi.getPendingScholarships(); setList(res.data?.data ?? []); }
    catch { setList([]); }
    finally { setLoading(false); }
  }

  async function handleApprove(userId, scholarshipId) {
    try {
      await academicApi.approveScholarship(userId, scholarshipId);
      setList(prev => prev.filter(s => !(s[0] === userId && s[3] === scholarshipId)));
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  async function handleReceived(userId, scholarshipId) {
    try {
      await academicApi.markScholarshipReceived(userId, scholarshipId);
      load();
    } catch (e) { alert('Lỗi: ' + (e?.response?.data?.message ?? e.message)); }
  }

  return (
    <div>
      {loading ? <div className="py-8 text-center text-ink-subtle text-sm">Đang tải...</div>
      : list.length === 0 ? <div className="py-8 text-center text-ink-subtle text-sm">Không có học bổng chờ duyệt</div>
      : (
        <table className="w-full text-sm border border-surface-border rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-xs uppercase text-ink-subtle">
            <tr>{['MSSV','Họ tên','Học bổng','Trạng thái',''].map(h=><th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {list.map((s,i)=>{
              const userId=s[0], name=s[1], code=s[2], schId=s[3], schName=s[4], status=s[5];
              return (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-xs">{code}</td>
                  <td className="px-4 py-2.5 font-medium text-ink">{name}</td>
                  <td className="px-4 py-2.5 text-ink-subtle">{schName}</td>
                  <td className="px-4 py-2.5"><Badge variant="neutral">{status}</Badge></td>
                  <td className="px-4 py-2.5 flex gap-2">
                    {status === 'pending' && (
                      <button onClick={() => handleApprove(userId, schId)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs rounded-lg hover:bg-emerald-200 font-medium transition-colors">
                        <CheckCircle size={12}/> Duyệt
                      </button>
                    )}
                    {status === 'approved' && (
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
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'leaderboard', label: 'Bảng xếp hạng', icon: Trophy },
  { key: 'warning',     label: 'Cảnh báo học vụ', icon: ShieldAlert },
  { key: 'scholarship', label: 'Học bổng',        icon: Award },
];

export default function ApprovalPage() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">Duyệt dữ liệu</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Duyệt để hiển thị dữ liệu lên App sinh viên</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              tab === key ? 'bg-white text-ink shadow-sm' : 'text-ink-subtle hover:text-ink'
            }`}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        {tab === 'leaderboard' && <LeaderboardTab/>}
        {tab === 'warning'     && <WarningTab/>}
        {tab === 'scholarship' && <ScholarshipTab/>}
      </div>
    </div>
  );
}