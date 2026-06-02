import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardCheck, Star, RefreshCw, ChevronDown, ChevronRight,
  CheckCircle, Clock, Search, Edit2, Check, X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { assessmentApi } from '../../api/assessmentApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  { id: 'overview',  label: 'Đánh giá rèn luyện', icon: ClipboardCheck },
  { id: 'advisor',   label: 'Đánh giá CVHT',       icon: Star           },
];

// ─── Inline score editor ──────────────────────────────────────────────────────
function ScoreCell({ value, editable, onSave }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');

  function open() { setVal(String(value ?? 0)); setEditing(true); }
  function cancel() { setEditing(false); }
  async function save() {
    const n = parseFloat(val);
    if (isNaN(n) || n < 0) { toast.error('Điểm không hợp lệ'); return; }
    await onSave(n);
    setEditing(false);
  }

  if (!editable) {
    const n = parseFloat(value) || 0;
    return <span className={scoreColor(n)}>{n.toFixed(1)}</span>;
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          type="number"
          min="0" max="100" step="0.5"
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel(); }}
          className="w-16 px-1 py-0.5 text-xs border border-brand-400 rounded focus:outline-none"
        />
        <button onClick={save}   className="text-green-600 hover:text-green-700"><Check size={13}/></button>
        <button onClick={cancel} className="text-red-400 hover:text-red-500"><X size={13}/></button>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 cursor-pointer group ${scoreColor(parseFloat(value)||0)}`}
      onClick={open}
    >
      {(parseFloat(value)||0).toFixed(1)}
      <Edit2 size={11} className="opacity-0 group-hover:opacity-60 transition-opacity"/>
    </span>
  );
}

// ─── Approval badge ───────────────────────────────────────────────────────────
function ApprovalBadge({ approved, at }) {
  if (approved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <CheckCircle size={13}/> Đã duyệt
        {at && <span className="text-ink-subtle font-normal">({fmt(at)})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-subtle">
      <Clock size={13}/> Chờ duyệt
    </span>
  );
}

// ─── Expandable student row ───────────────────────────────────────────────────
function StudentRow({ record, index, user, onScoreChange, onApprove }) {
  const [open, setOpen] = useState(false);

  async function handleSaveScore(criteriaId, column, score) {
    const apiMap = {
      tapThe: assessmentApi.setTapThe,
      boMon:  assessmentApi.setBoMon,
      khoa:   assessmentApi.setKhoa,
      truong: assessmentApi.setTruong,
    };
    try {
      await apiMap[column]({
        userId: record.userId,
        periodId: record.periodId,
        items: [{ criteriaId, score }],
      });
      onScoreChange(record.userId, criteriaId, column, score);
      toast.success('Đã lưu điểm');
    } catch { toast.error('Lưu điểm thất bại'); }
  }

  async function handleApprove(type) {
    const apiMap = {
      advisor: assessmentApi.approveAdvisor,
      khoa:    assessmentApi.approveKhoa,
      truong:  assessmentApi.approveTruong,
    };
    try {
      await apiMap[type]({ userId: record.userId, periodId: record.periodId });
      onApprove(record.userId, type);
      toast.success('Duyệt thành công');
    } catch { toast.error('Duyệt thất bại'); }
  }

  return (
    <>
      <tr
        className="border-b border-surface-border hover:bg-surface-subtle cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-3 py-3 text-sm text-ink-subtle">{index + 1}</td>
        <td className="px-3 py-3 text-sm font-medium text-ink">{record.userId}</td>
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
                <button
                  onClick={e => { e.stopPropagation(); handleApprove('advisor'); }}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✓ Duyệt (CVHT)
                </button>
              )}
              {canApprove(user, 'khoa') && record.advisorApproved && !record.khoaApproved && (
                <button
                  onClick={e => { e.stopPropagation(); handleApprove('khoa'); }}
                  className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ✓ Duyệt (Khoa)
                </button>
              )}
              {canApprove(user, 'truong') && record.khoaApproved && !record.truongApproved && (
                <button
                  onClick={e => { e.stopPropagation(); handleApprove('truong'); }}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✓ Duyệt (Trường)
                </button>
              )}
            </div>

            {/* Criteria detail table */}
            {record.criteriaDetails?.length > 0 && (
              <div className="rounded-lg border border-surface-border overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-white border-b border-surface-border">
                      {['Tiêu chí', 'SV tự ĐG', 'Minh chứng', 'Tập thể lớp', 'Bộ môn', 'Khoa', 'Trường'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border bg-white">
                    {record.criteriaDetails.map(d => (
                      <tr key={d.criteriaId}>
                        <td className="px-3 py-2 text-ink">#{d.criteriaId}</td>
                        <td className={`px-3 py-2 ${scoreColor(d.studentScore)}`}>
                          {(parseFloat(d.studentScore)||0).toFixed(1)}
                        </td>
                        <td className="px-3 py-2 text-ink-subtle">
                          {d.evidenceUris?.length > 0
                            ? <span className="text-blue-600">{d.evidenceUris.length} file</span>
                            : '—'}
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell
                            value={d.tapTheScore}
                            editable={canEdit(user, 'tapThe')}
                            onSave={score => handleSaveScore(d.criteriaId, 'tapThe', score)}
                          />
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell
                            value={d.boMonScore}
                            editable={canEdit(user, 'boMon')}
                            onSave={score => handleSaveScore(d.criteriaId, 'boMon', score)}
                          />
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell
                            value={d.khoaScore}
                            editable={canEdit(user, 'khoa')}
                            onSave={score => handleSaveScore(d.criteriaId, 'khoa', score)}
                          />
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <ScoreCell
                            value={d.truongScore}
                            editable={canEdit(user, 'truong')}
                            onSave={score => handleSaveScore(d.criteriaId, 'truong', score)}
                          />
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
      return {
        ...r,
        criteriaDetails: r.criteriaDetails.map(d => {
          if (d.criteriaId !== criteriaId) return d;
          const key = { tapThe: 'tapTheScore', boMon: 'boMonScore', khoa: 'khoaScore', truong: 'truongScore' }[column];
          return { ...d, [key]: score };
        }),
      };
    }));
  }

  function handleApprove(userId, type) {
    const now = new Date().toISOString();
    setData(prev => prev.map(r => {
      if (r.userId !== userId) return r;
      if (type === 'advisor') return { ...r, advisorApproved: true, advisorApprovedAt: now };
      if (type === 'khoa')    return { ...r, khoaApproved: true,    khoaApprovedAt: now   };
      if (type === 'truong')  return { ...r, truongApproved: true,  truongApprovedAt: now };
      return r;
    }));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(r => String(r.userId).includes(q));
  }, [data, search]);

  if (loading) return (
    <div className="card p-6 space-y-3">
      {Array.from({length:5}).map((_,i) => (
        <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse"/>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo User ID..."
            className="pl-9 pr-4 py-2 text-sm border border-surface-border rounded-lg w-52 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-sm text-ink-subtle">{filtered.length} sinh viên</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-subtle">
              {['#','User ID','Điểm SV','CVHT duyệt','Khoa duyệt','Trường duyệt','Nộp lúc',''].map(h => (
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
              <StudentRow
                key={record.userId}
                record={record}
                index={i}
                user={user}
                onScoreChange={handleScoreChange}
                onApprove={handleApprove}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Advisor assessment tab ───────────────────────────────────────────────────
function AdvisorTab({ periodId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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
      {Array.from({length:5}).map((_,i) => (
        <div key={i} className="h-10 bg-surface-subtle rounded animate-pulse"/>
      ))}
    </div>
  );

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-surface-border bg-surface-subtle">
            {['#','User ID','Học kỳ','Tổng điểm','Số tiêu chí','Nộp lúc'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-subtle">Chưa có dữ liệu đánh giá CVHT.</td></tr>
          ) : data.map((r, i) => {
            const total = r.items?.reduce((s, x) => s + (parseFloat(x.score)||0), 0) ?? 0;
            return (
              <tr key={r.userId} className="border-b border-surface-border hover:bg-surface-subtle">
                <td className="px-4 py-3 text-ink-subtle">{i+1}</td>
                <td className="px-4 py-3 font-medium text-ink">{r.userId}</td>
                <td className="px-4 py-3 text-ink-subtle">{r.periodId}</td>
                <td className={`px-4 py-3 ${scoreColor(total)}`}>{total.toFixed(1)}</td>
                <td className="px-4 py-3 text-ink-subtle">{r.items?.length ?? 0}</td>
                <td className="px-4 py-3 text-ink-subtle">{fmt(r.submittedAt)}</td>
              </tr>
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
  const [activeTab,       setActiveTab]       = useState('overview');
  const [periods,         setPeriods]         = useState([]);
  const [periodId,        setPeriodId]        = useState('');
  const [periodsLoading,  setPeriodsLoading]  = useState(true);

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink font-display">Đánh giá rèn luyện</h1>
          <p className="text-sm text-ink-subtle mt-0.5">
            Quản lý đánh giá rèn luyện sinh viên và đánh giá CVHT theo học kỳ
          </p>
        </div>
        <div className="flex items-center gap-3">
          {periodsLoading ? (
            <div className="h-9 w-44 bg-surface-subtle rounded-lg animate-pulse"/>
          ) : (
            <select
              value={periodId}
              onChange={e => setPeriodId(e.target.value)}
              className="text-sm border border-surface-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${activeTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-ink-subtle hover:text-ink'}`}
          >
            <Icon size={15}/>{label}
          </button>
        ))}
      </div>

      {/* Content */}
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