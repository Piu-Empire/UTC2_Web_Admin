// src/pages/dormitory/DormitoryRegistrationPage.jsx
// Admin duyệt / từ chối đăng ký ký túc xá của sinh viên
import { useState, useEffect, useCallback } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, Check, X, RefreshCw, Building2 } from 'lucide-react';
import toast       from 'react-hot-toast';
import DataTable   from '../../components/common/DataTable';
import Pagination  from '../../components/common/Pagination';
import Badge       from '../../components/common/Badge';
import Button      from '../../components/common/Button';
import EmptyState  from '../../components/common/EmptyState';
import Skeleton    from '../../components/common/Skeleton';
import {
  dormitoryAdminApi,
  REG_STATUS_VARIANT,
  ALL_REG_STATUSES,
} from '../../api/dormitoryApi';
import { vnd } from '../../utils/formatters';

const PAGE_SIZE = 10;
const col       = createColumnHelper();

const SELECT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('vi-VN'); }
  catch { return iso; }
}

function statusLabel(s) {
  const map = {
    'chờ duyệt': 'Chờ duyệt',
    'đã duyệt':  'Đã duyệt',
    'từ chối':   'Từ chối',
    'đã hủy':    'Đã hủy',
  };
  return map[s] ?? s;
}

// ── Detail / Action Drawer ────────────────────────────────────────────────────
function Drawer({ item, onClose, onUpdate }) {
  const [note,    setNote]    = useState('');
  const [saving,  setSaving]  = useState(false);

  async function handleAction(newStatus) {
    if (newStatus === 'từ chối' && !note.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setSaving(true);
    try {
      await dormitoryAdminApi.updateStatus(item.id, { status: newStatus, note });
      onUpdate(item.id, newStatus, note);
      toast.success(newStatus === 'đã duyệt' ? 'Đã duyệt đăng ký KTX!' : 'Đã từ chối đăng ký.');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setSaving(false);
    }
  }

  const isPending = item.status === 'chờ duyệt';

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div>
            <p className="font-display font-semibold text-ink">Đăng ký #{item.id}</p>
            <p className="text-xs text-ink-muted mt-0.5">Chi tiết đăng ký KTX</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover text-ink-subtle transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Trạng thái hiện tại */}
          <div className="rounded-xl bg-surface-muted p-4 space-y-1.5">
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Trạng thái</p>
            <Badge variant={REG_STATUS_VARIANT[item.status] ?? 'neutral'}>
              {statusLabel(item.status)}
            </Badge>
          </div>

          {/* Thông tin sinh viên */}
          <div>
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">Thông tin sinh viên</p>
            <div className="space-y-2 text-sm">
              <Row label="Họ tên"      value={item.studentName  ?? '—'} />
              <Row label="MSSV"        value={item.studentCode  ?? '—'} />
              <Row label="Email"       value={item.email        ?? '—'} />
              <Row label="Lớp"         value={item.className    ?? '—'} />
            </div>
          </div>

          <div className="border-t border-surface-border" />

          {/* Thông tin phòng */}
          <div>
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">Thông tin phòng</p>
            <div className="space-y-2 text-sm">
              <Row label="Phòng"       value={item.roomCode     ?? item.roomName ?? '—'} />
              <Row label="Tòa"         value={item.building     ?? '—'} />
              <Row label="Loại phòng"  value={item.roomType     ?? '—'} />
              <Row label="Số tháng"    value={item.months ? `${item.months} tháng` : '—'} />
              <Row label="Ngày bắt đầu" value={fmtDate(item.startDate)} />
              <Row label="Ngày kết thúc" value={fmtDate(item.endDate)} />
              <Row label="Giá/tháng"
                value={item.pricePerMonth ? vnd(item.pricePerMonth) : '—'}
                valueClass="font-semibold text-brand-700"
              />
              <Row label="Tổng tiền"
                value={item.totalFee ? vnd(item.totalFee) : '—'}
                valueClass="font-bold text-lg text-brand-700"
              />
            </div>
          </div>

          <div className="border-t border-surface-border" />

          {/* Ghi chú admin */}
          <div>
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-3">Ngày đăng ký</p>
            <p className="text-sm text-ink">{fmtDate(item.registeredAt ?? item.createdAt)}</p>
          </div>

          {item.adminNote && (
            <div>
              <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-1">Ghi chú trước đó</p>
              <p className="text-sm text-ink bg-surface-muted rounded-lg p-3">{item.adminNote}</p>
            </div>
          )}

          {/* Ghi chú khi duyệt / từ chối */}
          {isPending && (
            <div>
              <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wide block mb-2">
                Ghi chú (bắt buộc khi từ chối)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={3}
                placeholder="Nhập lý do từ chối hoặc ghi chú duyệt..."
                className={`${SELECT} resize-none`}
              />
            </div>
          )}
        </div>

        {/* Footer — action buttons */}
        {isPending && (
          <div className="border-t border-surface-border p-4 flex gap-3">
            <Button
              variant="primary"
              disabled={saving}
              onClick={() => handleAction('đã duyệt')}
              className="flex-1 gap-2"
            >
              <Check size={15} />
              Duyệt
            </Button>
            <Button
              variant="danger"
              disabled={saving}
              onClick={() => handleAction('từ chối')}
              className="flex-1 gap-2"
            >
              <X size={15} />
              Từ chối
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, valueClass = 'text-ink' }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-ink-subtle flex-shrink-0">{label}</span>
      <span className={`text-right ${valueClass}`}>{value}</span>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, count, variant }) {
  const colors = {
    warning: 'bg-amber-50  text-amber-700  border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    error:   'bg-rose-50    text-rose-700    border-rose-200',
    neutral: 'bg-slate-50   text-slate-600   border-slate-200',
  };
  return (
    <div className={`rounded-xl border px-5 py-4 ${colors[variant] ?? colors.neutral}`}>
      <p className="text-2xl font-display font-bold">{count}</p>
      <p className="text-xs font-medium mt-0.5">{label}</p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DormitoryRegistrationPage() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [selected,   setSelected]   = useState(null);

  // Stats
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  // Normalize backend entity → frontend row (dormRegId → id)
  function normalize(reg) {
    return {
      ...reg,
      id: reg.dormRegId ?? reg.id,
    };
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dormitoryAdminApi.listRegistrations();
      const data = res.data?.data;
      // Backend trả về List thẳng (không phân trang)
      const raw  = Array.isArray(data) ? data : (data?.content ?? []);
      const list = raw.map(normalize);

      // Lọc phía client nếu có filterStatus
      const filtered = filterStatus
        ? list.filter(r => r.status === filterStatus)
        : list;

      setRows(filtered);
      setTotal(filtered.length);

      // Tính stats từ toàn bộ
      const pending  = list.filter(r => r.status === 'chờ duyệt').length;
      const approved = list.filter(r => r.status === 'đã duyệt').length;
      const rejected = list.filter(r => r.status === 'đã từ chối' || r.status === 'từ chối').length;
      setStats({ pending, approved, rejected });
    } catch (err) {
      toast.error('Không tải được dữ liệu đăng ký KTX');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  function handleUpdate(id, newStatus, note) {
    setRows(prev =>
      prev.map(r => r.id === id ? { ...r, status: newStatus, adminNote: note } : r)
    );
    // Cập nhật stats
    setStats(prev => {
      const row = rows.find(r => r.id === id);
      const old = row?.status;
      const next = { ...prev };
      if (old === 'chờ duyệt') next.pending  = Math.max(0, next.pending - 1);
      if (newStatus === 'đã duyệt') next.approved += 1;
      if (newStatus === 'từ chối')  next.rejected  += 1;
      return next;
    });
  }

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = [
    col.accessor('id', {
      header: 'ID',
      size: 60,
      cell: i => <span className="text-ink-muted text-xs">#{i.getValue()}</span>,
    }),
    col.accessor('studentName', {
      header: 'Sinh viên',
      cell: i => (
        <div>
          <p className="font-medium text-ink text-sm">{i.getValue() ?? '—'}</p>
          <p className="text-xs text-ink-muted">{i.row.original.studentCode ?? ''}</p>
        </div>
      ),
    }),
    col.accessor('roomCode', {
      header: 'Phòng',
      cell: i => (
        <div>
          <p className="font-medium text-sm">{i.getValue() ?? i.row.original.roomName ?? '—'}</p>
          <p className="text-xs text-ink-muted">Tòa {i.row.original.building ?? '?'}</p>
        </div>
      ),
    }),
    col.accessor('months', {
      header: 'Thời gian',
      size: 100,
      cell: i => <span className="text-sm">{i.getValue() ? `${i.getValue()} tháng` : '—'}</span>,
    }),
    col.accessor('totalFee', {
      header: 'Tổng tiền',
      size: 130,
      cell: i => (
        <span className="font-semibold text-brand-700 text-sm">
          {i.getValue() ? vnd(i.getValue()) : '—'}
        </span>
      ),
    }),
    col.accessor('registeredAt', {
      header: 'Ngày đăng ký',
      size: 110,
      cell: i => <span className="text-xs text-ink-muted">{fmtDate(i.getValue() ?? i.row.original.createdAt)}</span>,
    }),
    col.accessor('status', {
      header: 'Trạng thái',
      size: 120,
      cell: i => (
        <Badge variant={REG_STATUS_VARIANT[i.getValue()] ?? 'neutral'}>
          {statusLabel(i.getValue())}
        </Badge>
      ),
    }),
    col.display({
      id: 'actions',
      size: 60,
      cell: ({ row }) => (
        <button
          onClick={() => setSelected(row.original)}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={15} />
        </button>
      ),
    }),
  ];

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-ink flex items-center gap-2">
            <Building2 size={22} className="text-brand-600" />
            Duyệt đăng ký Ký túc xá
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Quản lý và duyệt các đơn đăng ký phòng KTX của sinh viên
          </p>
        </div>
        <Button variant="ghost" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Chờ duyệt"  count={stats.pending}  variant="warning" />
        <StatCard label="Đã duyệt"   count={stats.approved} variant="success" />
        <StatCard label="Từ chối"    count={stats.rejected} variant="error"   />
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
        >
          <option value="">Tất cả trạng thái</option>
          {ALL_REG_STATUSES.map(s => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <span className="text-sm text-ink-muted">
          {total} đăng ký
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Không có đăng ký nào"
          description={filterStatus ? `Không có đơn đăng ký với trạng thái "${statusLabel(filterStatus)}"` : 'Chưa có sinh viên nào đăng ký KTX.'}
        />
      ) : (
        <>
          <DataTable columns={columns} data={rows} />
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </>
      )}

      {/* Drawer */}
      {selected && (
        <Drawer
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}