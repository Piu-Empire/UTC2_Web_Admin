import { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Trophy, Award, AlertTriangle, Search } from 'lucide-react';
import { academicApi } from '../../api/academicApi';
import Badge from '../../components/common/Badge';
import { SkeletonBar } from '../../components/common/Skeleton';
import { gpaColor, vnd } from '../../utils/formatters';

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'grades',       label: 'Bảng điểm',      icon: GraduationCap },
  { id: 'leaderboard',  label: 'Xếp hạng',        icon: Trophy        },
  { id: 'scholarships', label: 'Học bổng',         icon: Award         },
  { id: 'warnings',     label: 'Cảnh báo học vụ', icon: AlertTriangle },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(str) {
  if (!str || str.length < 10) return '—';
  const [y, m, d] = str.substring(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function letterBadge(letter) {
  if (!letter) return <span className="text-ink-subtle">—</span>;
  const v = ['A', 'A+'].includes(letter) ? 'success'
    : ['B+', 'B'].includes(letter) ? 'info'
    : ['C+', 'C'].includes(letter) ? 'warning'
    : 'error';
  return <Badge variant={v}>{letter}</Badge>;
}

function mapWarningType(type) {
  const m = { FAILED_EXAM: 'Điểm không đạt', LOW_GPA: 'GPA thấp', ATTENDANCE: 'Vắng mặt' };
  return m[type] ?? 'Cảnh báo học vụ';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <div className="card overflow-hidden">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-surface-border">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="flex-1"><SkeletonBar className="h-4 w-3/4" /></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Grades ─────────────────────────────────────────────────────────────
function GradesTab() {
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState([]);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    academicApi.getGrades()
      .then(r => setData(r.data?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return data;
    return data.filter(g =>
      g.courseCode?.toLowerCase().includes(q) ||
      g.courseName?.toLowerCase().includes(q)
    );
  }, [data, search]);

  if (loading) return <TableSkeleton cols={9} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã môn, tên môn..."
            className="pl-9 pr-4 py-2 text-sm border border-surface-border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-sm text-ink-subtle">{filtered.length} môn học</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-subtle">
              {['Mã môn', 'Tên môn', 'TC', 'Giữa kỳ', 'Cuối kỳ', 'Tổng kết', 'Điểm chữ', 'Học kỳ', 'Kết quả'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filtered.length === 0
              ? <tr><td colSpan={9} className="text-center py-10 text-ink-subtle">Không có dữ liệu</td></tr>
              : filtered.map((g, i) => (
                <tr key={i} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{g.courseCode}</td>
                  <td className="px-4 py-3 font-medium text-ink">{g.courseName}</td>
                  <td className="px-4 py-3 text-center text-ink-subtle">{g.credits}</td>
                  <td className="px-4 py-3 text-center">{g.midtermScore?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{g.finalScore?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{g.totalScore?.toFixed(1) ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{letterBadge(g.letterGrade)}</td>
                  <td className="px-4 py-3 text-xs text-ink-subtle whitespace-nowrap">
                    {g.semesterName ? `${g.semesterName} ${g.academicYear ?? ''}`.trim() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={g.isPassed ? 'success' : 'error'}>
                      {g.isPassed ? 'Đạt' : 'Không đạt'}
                    </Badge>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Leaderboard ─────────────────────────────────────────────────────────
function LeaderboardTab() {
  const [loading,      setLoading]      = useState(true);
  const [data,         setData]         = useState([]);
  const [academicYear, setAcademicYear] = useState('2025-2026');

  useEffect(() => {
    setLoading(true);
    academicApi.getLeaderboard(null, academicYear)
      .then(r => setData(r.data?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [academicYear]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          className="border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {['2025-2026', '2024-2025', '2023-2024'].map(y => <option key={y}>{y}</option>)}
        </select>
        {!loading && <span className="text-sm text-ink-subtle">{data.length} sinh viên</span>}
      </div>

      {loading ? <TableSkeleton cols={5} /> : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-surface-subtle">
                {['Hạng', 'MSSV', 'Họ và tên', 'GPA', 'Tín chỉ'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {data.length === 0
                ? <tr><td colSpan={5} className="text-center py-10 text-ink-subtle">Không có dữ liệu</td></tr>
                : data.map((e, i) => (
                  <tr key={i} className={`hover:bg-surface-hover transition-colors ${e.isCurrentUser ? 'bg-brand-50' : ''}`}>
                    <td className="px-4 py-3">
                      {e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : ''}
                      <span className={`ml-1 font-semibold ${e.rank <= 3 ? 'text-amber-600' : 'text-ink-subtle'}`}>
                        #{e.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{e.studentCode}</td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {e.fullName}
                      {e.isCurrentUser && <span className="ml-2 text-xs text-brand-600 font-normal">(Bạn)</span>}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${gpaColor(e.gpa)}`}>{e.gpa?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink-subtle">{e.totalCredits}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Scholarships ────────────────────────────────────────────────────────
function ScholarshipsTab() {
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState([]);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    academicApi.getScholarships()
      .then(r => setData(r.data?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'received')     return data.filter(s => s.status === 'received');
    if (filter === 'not_received') return data.filter(s => s.status === 'not_received');
    return data;
  }, [data, filter]);

  const FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'received', label: 'Đã nhận' },
    { key: 'not_received', label: 'Chưa nhận' },
  ];

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-4 space-y-2">
          <SkeletonBar className="h-5 w-3/4" />
          <SkeletonBar className="h-4 w-1/2" />
          <SkeletonBar className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === f.key ? 'bg-brand-700 text-white' : 'bg-surface-subtle text-ink hover:bg-surface-hover'}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-2 text-sm text-ink-subtle">{filtered.length} học bổng</span>
      </div>

      {filtered.length === 0
        ? <div className="card p-10 text-center text-ink-subtle">Không có dữ liệu</div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s, i) => (
              <div key={i} className="card p-4 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-ink leading-snug">{s.name}</p>
                  <Badge variant={s.status === 'received' ? 'success' : s.status === 'not_received' ? 'neutral' : 'warning'}>
                    {s.status === 'received' ? 'Đã nhận' : s.status === 'not_received' ? 'Chưa nhận' : 'Chưa xét'}
                  </Badge>
                </div>
                <p className="text-sm text-ink-subtle">{s.organization}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-emerald-600 font-semibold">{vnd(s.amount)}/{s.unit}</span>
                  <span className="text-ink-subtle">
                    GPA tối thiểu: <span className={gpaColor(s.minGpa)}>{s.minGpa}</span>
                  </span>
                </div>
                {s.description && <p className="text-xs text-ink-muted leading-relaxed">{s.description}</p>}
                {s.receivedAt   && <p className="text-xs text-ink-subtle">Ngày nhận: {s.receivedAt}</p>}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── Tab: Warnings ────────────────────────────────────────────────────────────
function WarningsTab() {
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState([]);

  useEffect(() => {
    academicApi.getWarnings()
      .then(r => setData(r.data?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TableSkeleton cols={4} />;

  if (data.length === 0) return (
    <div className="card p-12 text-center">
      <AlertTriangle size={40} className="mx-auto mb-3 text-emerald-400" />
      <p className="font-medium text-ink">Không có cảnh báo học vụ</p>
      <p className="text-sm text-ink-subtle mt-1">Tất cả sinh viên đang học tốt</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <span className="text-sm text-ink-subtle">{data.length} cảnh báo</span>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border bg-surface-subtle">
              {['Loại cảnh báo', 'Mô tả', 'Ngày cảnh báo', 'Trạng thái'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-ink-subtle uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {data.map((w, i) => (
              <tr key={i} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3">
                  <Badge variant={w.status === 'ACTIVE' ? 'error' : 'neutral'}>
                    {mapWarningType(w.warningType)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink max-w-sm">{w.description}</td>
                <td className="px-4 py-3 text-ink-subtle whitespace-nowrap">{formatDate(w.issuedAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={w.status === 'ACTIVE' ? 'error' : 'success'}>
                    {w.status === 'ACTIVE' ? 'Đang hiệu lực' : 'Đã giải quyết'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AcademicPage() {
  const [activeTab, setActiveTab] = useState('grades');

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-ink font-display">Kết quả học tập</h1>
        <p className="text-sm text-ink-subtle mt-0.5">Xem bảng điểm, xếp hạng, học bổng và cảnh báo học vụ</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
              ${activeTab === id
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-subtle hover:text-ink hover:border-surface-border'}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'grades'       && <GradesTab />}
        {activeTab === 'leaderboard'  && <LeaderboardTab />}
        {activeTab === 'scholarships' && <ScholarshipsTab />}
        {activeTab === 'warnings'     && <WarningsTab />}
      </div>
    </div>
  );
}