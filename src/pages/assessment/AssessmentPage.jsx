import { useState, useEffect, useMemo } from 'react';
import { ClipboardCheck, Star, Search, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { assessmentApi } from '../../api/assessmentApi';
import { SkeletonBar } from '../../components/common/Skeleton';
import Badge from '../../components/common/Badge';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'student', label: 'Đánh giá sinh viên',       icon: ClipboardCheck },
  { id: 'advisor', label: 'Đánh giá cố vấn học tập',  icon: Star           },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDatetime(str) {
  if (!str) return '—';
  try {
    const d = new Date(str);
    return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return str; }
}

function sumScore(items) {
  if (!items?.length) return 0;
  return items.reduce((s, i) => s + (parseFloat(i.score) || 0), 0);
}

function scoreBadge(score) {
  if (score >= 90) return <Badge variant="success">{score.toFixed(1)}</Badge>;
  if (score >= 65) return <Badge variant="info">{score.toFixed(1)}</Badge>;
  if (score >= 50) return <Badge variant="warning">{score.toFixed(1)}</Badge>;
  return <Badge variant="error">{score.toFixed(1)}</Badge>;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="card overflow-hidden">
      {Array.from({ length: 6 }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-surface-border">
          {Array.from({ length: 5 }).map((_, c) => (
            <div key={c} className="flex-1"><SkeletonBar className="h-4 w-3/4" /></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Expandable row ───────────────────────────────────────────────────────────
function StudentRow({ record, index }) {
  const [open, setOpen] = useState(false);
  const total = sumScore(record.items);

  return (
    <>
      <tr
        className="border-b border-surface-border hover:bg-surface-subtle cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <td className="px-4 py-3 text-sm text-ink-subtle">{index + 1}</td>
        <td className="px-4 py-3 text-sm font-medium text-ink">{record.userId}</td>
        <td className="px-4 py-3 text-sm text-ink-subtle">{record.periodId}</td>
        <td className="px-4 py-3">{scoreBadge(total)}</td>
        <td className="px-4 py-3 text-sm text-ink-subtle">{record.items?.length ?? 0} tiêu chí</td>
        <td className="px-4 py-3 text-sm text-ink-subtle">{formatDatetime(record.submittedAt)}</td>
        <td className="px-4 py-3 text-ink-subtle">
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </td>
      </tr>
      {open && record.items?.length > 0 && (
        <tr className="bg-surface-subtle">
          <td colSpan={7} className="px-6 py-3">
            <div className="overflow-x-auto rounded-lg border border-surface-border">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-white border-b border-surface-border">
                    <th className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide">Tiêu chí ID</th>
                    <th className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide">Điểm</th>
                    <th className="px-3 py-2 text-left text-ink-subtle font-semibold uppercase tracking-wide">Minh chứng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border bg-white">
                  {record.items.map(item => (
                    <tr key={item.criteriaId}>
                      <td className="px-3 py-2 text-ink">#{item.criteriaId}</td>
                      <td className="px-3 py-2 font-medium text-brand-600">{parseFloat(item.score).toFixed(2)}</td>
                      <td className="px-3 py-2 text-ink-subtle">
                        {item.evidenceUris?.length
                          ? <span className="badge badge-info">{item.evidenceUris.length} file</span>
                          : <span className="text-ink-subtle">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Assessment Table ─────────────────────────────────────────────────────────
function AssessmentTable({ data, loading, emptyText = 'Không có dữ liệu' }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(r => String(r.userId).includes(q));
  }, [data, search]);

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo User ID..."
            className="pl-9 pr-4 py-2 text-sm border border-surface-border rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-sm text-ink-subtle">{filtered.length} sinh viên</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-subtle">
              {['#', 'User ID', 'Học kỳ', 'Tổng điểm', 'Số tiêu chí', 'Thời gian nộp', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-subtle">{emptyText}</td>
              </tr>
            ) : (
              filtered.map((record, i) => (
                <StudentRow key={`${record.userId}-${record.periodId}`} record={record} index={i} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssessmentPage() {
  const [activeTab,  setActiveTab]  = useState('student');
  const [periods,    setPeriods]    = useState([]);
  const [periodId,   setPeriodId]   = useState('');
  const [data,       setData]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [periodsLoading, setPeriodsLoading] = useState(true);

  // Load periods once
  useEffect(() => {
    assessmentApi.getPeriods()
      .then(r => {
        const list = r.data?.data ?? [];
        setPeriods(list);
        // default to active period or first
        const active = list.find(p => p.isActive || p.active) ?? list[0];
        if (active) setPeriodId(active.periodId);
      })
      .catch(() => setPeriods([]))
      .finally(() => setPeriodsLoading(false));
  }, []);

  // Load data when period or tab changes
  useEffect(() => {
    if (!periodId) return;
    setLoading(true);
    setData([]);
    const fn = activeTab === 'student'
      ? assessmentApi.adminGetStudent(periodId)
      : assessmentApi.adminGetAdvisor(periodId);
    fn
      .then(r => setData(r.data?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [periodId, activeTab]);

  function refresh() {
    if (!periodId) return;
    setLoading(true);
    setData([]);
    const fn = activeTab === 'student'
      ? assessmentApi.adminGetStudent(periodId)
      : assessmentApi.adminGetAdvisor(periodId);
    fn
      .then(r => setData(r.data?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink font-display">Đánh giá rèn luyện</h1>
          <p className="text-sm text-ink-subtle mt-0.5">Xem kết quả đánh giá sinh viên và cố vấn học tập theo học kỳ</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          {periodsLoading ? (
            <SkeletonBar className="h-9 w-48" />
          ) : (
            <select
              value={periodId}
              onChange={e => setPeriodId(e.target.value)}
              className="text-sm border border-surface-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {periods.map(p => (
                <option key={p.periodId} value={p.periodId}>
                  {p.label} {(p.isActive || p.active) ? '(Đang mở)' : ''}
                </option>
              ))}
              {periods.length === 0 && <option value="">— Không có học kỳ —</option>}
            </select>
          )}

          <button
            onClick={refresh}
            disabled={loading || !periodId}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-surface-border rounded-lg hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-surface-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${activeTab === id
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-ink-subtle hover:text-ink'}
            `}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {!periodId && !periodsLoading ? (
        <div className="card px-6 py-12 text-center text-sm text-ink-subtle">
          Không tìm thấy học kỳ nào. Vui lòng kiểm tra cơ sở dữ liệu.
        </div>
      ) : (
        <AssessmentTable
          data={data}
          loading={loading || periodsLoading}
          emptyText={`Chưa có dữ liệu ${activeTab === 'student' ? 'đánh giá sinh viên' : 'đánh giá CVHT'} cho học kỳ này.`}
        />
      )}
    </div>
  );
}