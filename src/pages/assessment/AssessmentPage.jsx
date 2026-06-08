import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck, Star, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle, Clock, Search, Check, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assessmentApi } from '../../api/assessmentApi';

// ─── Criteria map (khớp với buildRlsvCriteria() trong App) ───────────────────
const CRITERIA_INFO = {
  1:  { label: '1.a', opts: [0,1,2,3,4,5] },
  2:  { label: '1.b', opts: [0,5] },
  3:  { label: '1.c', opts: [0,5] },
  4:  { label: '1.d', opts: [0,1,2,3,4,5] },
  6:  { label: '2.a', opts: [0,5] },
  7:  { label: '2.b', opts: [0,5] },
  8:  { label: '2.c', opts: [0,2.5] },
  9:  { label: '2.d', opts: [0,2.5] },
  10: { label: '2.e', opts: [0,2.5] },
  11: { label: '2.f', opts: [0,2.5] },
  12: { label: '2.g', opts: [0,2,5] },
  14: { label: '3.a', opts: [0,6] },
  15: { label: '3.b', opts: [0,6] },
  16: { label: '3.c', opts: [0,6] },
  17: { label: '3.d', opts: [0,2] },
  19: { label: '4.a', opts: [0,6] },
  20: { label: '4.b', opts: [0,4] },
  21: { label: '4.c', opts: [0,5] },
  22: { label: '4.d', opts: [0,5] },
  23: { label: '4.e', opts: [0,5] },
  25: { label: '5.a', opts: [0,5] },
  26: { label: '5.b', opts: [0,5] },
  28: { label: '6.a (trừ)', opts: [0,-10] },
  29: { label: '6.b (trừ)', opts: [0,-10] },
};

function criteriaLabel(id) {
  return CRITERIA_INFO[id]?.label ?? `#${id}`;
}

function criteriaOpts(id) {
  return CRITERIA_INFO[id]?.opts ?? null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') ?? '{}'); } catch { return {}; }
}

function canEdit(user, column) {
  if (user.role === 'ADMIN') return true;
  if (column === 'tapThe'  && user.role === 'STAFF' && user.staffLevel === 1) return true;
  if (column === 'boMon'   && user.role === 'STAFF' && user.staffLevel === 3) return true;
  if (column === 'khoa'    && user.role === 'STAFF' && user.staffLevel === 4) return true;
  if (column === 'truong'  && (user.role === 'ADMIN' || (user.role === 'STAFF' && user.staffLevel === 5))) return true;
  return false;
}

function canApprove(user, type) {
  if (user.role === 'ADMIN') return true;
  if (type === 'advisor' && user.role === 'ADVISOR') return true;
  if (type === 'khoa'    && user.role === 'STAFF' && user.staffLevel === 4) return true;
  if (type === 'truong'  && user.role === 'STAFF' && user.staffLevel === 5) return true;
  return false;
}

function fmt(dt) {
  if (!dt) return '—';
  try { return new Date(dt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return dt; }
}

function scoreColor(val) {
  const n = parseFloat(val) || 0;
  if (n >= 90) return 'text-green-600 font-semibold';
  if (n >= 65) return 'text-blue-600 font-semibold';
  if (n >= 50) return 'text-yellow-600 font-semibold';
  if (n > 0)   return 'text-red-500 font-semibold';
  return 'text-ink-subtle';
}

const TABS = [
  { id: 'overview', label: 'Đánh giá rèn luyện', icon: ClipboardCheck },
  { id: 'advisor',  label: 'Đánh giá CVHT',       icon: Star           },
];

// ─── Score cell với dropdown theo opts của criteria ───────────────────────────
function ScoreCell({ value, criteriaId, editable, onSave }) {
  const [editing, setEditing] = useState(false);
  const opts = criteriaOpts(criteriaId);
  const n = parseFloat(value) || 0;

  if (!editable) return <span className={scoreColor(n)}>{n}</span>;

  if (!editing) {
    return (
      <span
        className={`cursor-pointer underline decoration-dashed ${scoreColor(n)}`}
        onClick={() => setEditing(true)}
      >{n}</span>
    );
  }

  // Nếu có opts cố định → dùng dropdown
  if (opts) {
    return (
      <select
        autoFocus
        value={n}
        onChange={async e => {
          await onSave(parseFloat(e.target.value));
          setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className="text-xs border border-brand-400 rounded px-1 py-0.5 focus:outline-none"
      >
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  // Fallback: text input
  const [val, setVal] = useState(String(n));
  return (
    <span className="inline-flex items-center gap-1">
      <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={async e => {
          if (e.key === 'Enter') { await onSave(parseFloat(val)); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-14 px-1 py-0.5 text-xs border border-brand-400 rounded focus:outline-none"
      />
      <button onClick={async () => { await onSave(parseFloat(val)); setEditing(false); }}
        className="text-green-600 hover:text-green-700"><Check size={12}/></button>
      <button onClick={() => setEditing(false)}
        className="text-red-400 hover:text-red-500"><X size={12}/></button>
    </span>
  );
}

// ─── Approval badge ───────────────────────────────────────────────────────────
function ApprovalBadge({ approved, at }) {
  if (approved) return (
    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
      <CheckCircle size={12}/> Đã duyệt
      {at && <span className="text-ink-subtle font-normal">({fmt(at)})</span>}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
      <Clock size={12}/> Chờ duyệt
    </span>
  );
}

// ─── Student row ──────────────────────────────────────────────────────────────
function StudentRow({ record, index, user, onScoreChange, onApprove }) {
  const [open, setOpen] = useState(false);

  async function handleSave(criteriaId, column, score) {
    const apiMap = {
      tapThe: assessmentApi.setTapThe,
      boMon:  assessmentApi.setBoMon,
      khoa:   assessmentApi.setKhoa,
      truong: assessmentApi.setTruong,
    };
    try {
      await apiMap[column]({ userId: record.userId, periodId: record.periodId, items: [{ criteriaId, score }] });
      onScoreChange(record.userId, criteriaId, column, score);
      toast.success('Đã lưu');
    } catch { toast.error('Lưu thất bại'); }
  }

  async function handleApprove(type) {
    const apiMap = { advisor: assessmentApi.approveAdvisor, khoa: assessmentApi.approveKhoa, truong: assessmentApi.approveTruong };
    try {
      await apiMap[type]({ userId: record.userId, periodId: record.periodId });
      onApprove(record.userId, type);
      toast.success('Duyệt thành công');
    } catch { toast.error('Duyệt thất bại'); }
  }

  return (
    <>
      <tr className="border-b border-surface-border hover:bg-surface-subtle cursor-pointer select-none"
          onClick={() => setOpen(o => !o)}>
        <td className="px-3 py-3 text-sm text-ink-subtle">{index + 1}</td>
        <td className="px-3 py-3 text-sm font-medium text-ink">{record.studentCode || record.userId}</td>
        <td className={`px-3 py-3 text-sm ${scoreColor(record.studentTotalScore)}`}>
          {(parseFloat(record.studentTotalScore)||0).toFixed(1)}
        </td>
        <td className="px-3 py-3 text-sm"><ApprovalBadge approved={record.advisorApproved} at={record.advisorApprovedAt}/></td>
        <td className="px-3 py-3 text-sm"><ApprovalBadge approved={record.khoaApproved}    at={record.khoaApprovedAt}/></td>
        <td className="px-3 py-3 text-sm"><ApprovalBadge approved={record.truongApproved}  at={record.truongApprovedAt}/></td>
        <td className="px-3 py-3 text-sm text-ink-subtle">{fmt(record.submittedAt)}</td>
        <td className="px-3 py-3 text-ink-subtle">
          {open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
        </td>
      </tr>

      {open && (
        <tr className="bg-surface-subtle">
          <td colSpan={8} className="px-4 py-4">
            {/* Approve buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {canApprove(user, 'advisor') && !record.advisorApproved && (
                <button onClick={e => { e.stopPropagation(); handleApprove('advisor'); }}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ✓ Duyệt (CVHT)
                </button>
              )}
              {canApprove(user, 'khoa') && record.advisorApproved && !record.khoaApproved && (
                <button onClick={e => { e.stopPropagation(); handleApprove('khoa'); }}
                  className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  ✓ Duyệt (Khoa)
                </button>
              )}
              {canApprove(user, 'truong') && record.khoaApproved && !record.truongApproved && (
                <button onClick={e => { e.stopPropagation(); handleApprove('truong'); }}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                  ✓ Duyệt (Trường)
                </button>
              )}
            </div>

            {record.criteriaDetails?.length > 0 && (
              <div className="rounded-lg border border-surface-border overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-white border-b border-surface-border">
                      {['Tiêu chí','SV tự ĐG','Minh chứng','Tập thể lớp','Bộ môn','Khoa','Trường'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border bg-white">
                    {record.criteriaDetails.map(d => (
                      <tr key={d.criteriaId}>
                        <td className="px-3 py-2 font-medium text-ink">{criteriaLabel(d.criteriaId)}</td>
                        <td className={`px-3 py-2 ${scoreColor(d.studentScore)}`}>{parseFloat(d.studentScore)||0}</td>
                        <td className="px-3 py-2 text-ink-subtle">
                          {d.evidenceUris?.length > 0
                            ? <span className="text-blue-600">{d.evidenceUris.length} file</span>
                            : '—'}
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell value={d.tapTheScore} criteriaId={d.criteriaId}
                            editable={canEdit(user,'tapThe')}
                            onSave={s => handleSave(d.criteriaId,'tapThe',s)}/>
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell value={d.boMonScore} criteriaId={d.criteriaId}
                            editable={canEdit(user,'boMon')}
                            onSave={s => handleSave(d.criteriaId,'boMon',s)}/>
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell value={d.khoaScore} criteriaId={d.criteriaId}
                            editable={canEdit(user,'khoa')}
                            onSave={s => handleSave(d.criteriaId,'khoa',s)}/>
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell value={d.truongScore} criteriaId={d.criteriaId}
                            editable={canEdit(user,'truong')}
                            onSave={s => handleSave(d.criteriaId,'truong',s)}/>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ periodId, user }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    assessmentApi.adminGetOverview(periodId)
      .then(r => setData(r.data?.data ?? []))
      .catch(() => toast.error('Tải dữ liệu thất bại'))
      .finally(() => setLoading(false));
  }, [periodId]);

  function handleScoreChange(userId, criteriaId, column, score) {
    setData(prev => prev.map(r => {
      if (r.userId !== userId) return r;
      return { ...r, criteriaDetails: r.criteriaDetails.map(d => {
        if (d.criteriaId !== criteriaId) return d;
        const k = { tapThe:'tapTheScore', boMon:'boMonScore', khoa:'khoaScore', truong:'truongScore' }[column];
        return { ...d, [k]: score };
      })};
    }));
  }

  function handleApprove(userId, type) {
    const now = new Date().toISOString();
    setData(prev => prev.map(r => {
      if (r.userId !== userId) return r;
      if (type === 'advisor') return { ...r, advisorApproved: true, advisorApprovedAt: now };
      if (type === 'khoa')    return { ...r, khoaApproved: true,    khoaApprovedAt: now };
      if (type === 'truong')  return { ...r, truongApproved: true,  truongApprovedAt: now };
      return r;
    }));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(r => String(r.studentCode || r.userId).toLowerCase().includes(q));
  }, [data, search]);

  if (loading) return (
    <div className="card p-6 space-y-3">
      {Array.from({length:5}).map((_,i)=>(
        <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse"/>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo MSSV..."
            className="pl-9 pr-4 py-2 text-sm border border-surface-border rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-brand-500"/>
        </div>
        <span className="text-sm text-ink-subtle">{filtered.length} sinh viên</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-subtle">
              {['#','MSSV','Điểm SV','CVHT duyệt','Khoa duyệt','Trường duyệt','Nộp lúc',''].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-ink-subtle">
                Chưa có dữ liệu cho học kỳ này.
              </td></tr>
            ) : filtered.map((record, i) => (
              <StudentRow key={record.userId} record={record} index={i}
                user={user} onScoreChange={handleScoreChange} onApprove={handleApprove}/>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Advisor tab ──────────────────────────────────────────────────────────────
const CVHT_MAX = 60;

function AdvisorTab({ periodId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    assessmentApi.adminGetAdvisor(periodId)
      .then(r => setData(r.data?.data ?? []))
      .catch(() => toast.error('Tải dữ liệu thất bại'))
      .finally(() => setLoading(false));
  }, [periodId]);

  if (loading) return (
    <div className="card p-6 space-y-3">
      {Array.from({length:5}).map((_,i)=>(
        <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse"/>
      ))}
    </div>
  );

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-subtle">
            {['#','MSSV','Tổng điểm','Số tiêu chí','Ý kiến sinh viên','Nộp lúc',''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-subtle">
              Chưa có dữ liệu đánh giá CVHT.
            </td></tr>
          ) : data.map((r, i) => {
            const total = r.items?.reduce((s,x) => s+(parseFloat(x.score)||0), 0) ?? 0;
            const isOpen = expanded === r.userId;
            return (
              <>
                <tr key={r.userId} className="border-b border-surface-border hover:bg-surface-subtle cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : r.userId)}>
                  <td className="px-4 py-3 text-ink-subtle">{i+1}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r.userId}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">
                    {total.toFixed(1)}<span className="text-ink-subtle font-normal">/{CVHT_MAX}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-subtle">{r.items?.length ?? 0}/12</td>
                  <td className="px-4 py-3 text-ink-subtle max-w-xs truncate">
                    {r.studentOpinion || <span className="italic text-ink-subtle/60">—</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-subtle">{fmt(r.submittedAt)}</td>
                  <td className="px-4 py-3 text-ink-subtle">
                    {isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                  </td>
                </tr>
                {isOpen && r.items?.length > 0 && (
                  <tr key={`${r.userId}-d`} className="bg-surface-subtle">
                    <td colSpan={7} className="px-6 py-3">
                      <div className="rounded-lg border border-surface-border overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr className="bg-white border-b border-surface-border">
                              <th className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide">Tiêu chí</th>
                              <th className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide">Điểm (1-5)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border bg-white">
                            {r.items.map(d => (
                              <tr key={d.criteriaId}>
                                <td className="px-3 py-2 text-ink">CVHT {d.criteriaId - 99}</td>
                                <td className="px-3 py-2 font-medium text-brand-600">{parseFloat(d.score).toFixed(1)}/5</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {r.studentOpinion && (
                        <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-ink border border-amber-200">
                          <span className="font-medium text-amber-700">Ý kiến sinh viên: </span>
                          "{r.studentOpinion}"
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssessmentPage() {
  const user = useMemo(() => getUser(), []);
  const [activeTab,      setActiveTab]      = useState('overview');
  const [periods,        setPeriods]        = useState([]);
  const [periodId,       setPeriodId]       = useState('');
  const [periodsLoading, setPeriodsLoading] = useState(true);

  useEffect(() => {
    assessmentApi.getPeriods()
      .then(r => {
        const list = r.data?.data ?? [];
        setPeriods(list);
        const active = list.find(p => p.isActive || p.active) ?? list[0];
        if (active) setPeriodId(active.periodId);
      })
      .catch(() => setPeriods([]))
      .finally(() => setPeriodsLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink font-display">Đánh giá rèn luyện</h1>
          <p className="text-sm text-ink-subtle mt-0.5">Quản lý đánh giá rèn luyện sinh viên và đánh giá CVHT theo học kỳ</p>
        </div>
        <div className="flex items-center gap-3">
          {periodsLoading ? (
            <div className="h-9 w-44 bg-surface-subtle rounded-lg animate-pulse"/>
          ) : (
            <select value={periodId} onChange={e => setPeriodId(e.target.value)}
              className="text-sm border border-surface-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
              {periods.map(p => (
                <option key={p.periodId} value={p.periodId}>
                  {p.label ?? p.periodId} {(p.isActive || p.active) ? '(Đang mở)' : ''}
                </option>
              ))}
              {periods.length === 0 && <option value="">— Không có học kỳ —</option>}
            </select>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-surface-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${activeTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-subtle hover:text-ink'}`}>
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {!periodId && !periodsLoading ? (
        <div className="card px-6 py-12 text-center text-sm text-ink-subtle">
          Không tìm thấy học kỳ nào.
        </div>
      ) : activeTab === 'overview' ? (
        <OverviewTab periodId={periodId} user={user}/>
      ) : (
        <AdvisorTab periodId={periodId}/>
      )}
    </div>
  );
}