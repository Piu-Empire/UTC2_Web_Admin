import { useState, useMemo, useEffect, useCallback } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, X, ClipboardCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable  from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Badge      from '../components/common/Badge';
import Button     from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Skeleton   from '../components/common/Skeleton';
import {
  serviceRequestApi,
  STATUS_LABEL,
  STATUS_VARIANT,
  ALL_STATUSES,
  SERVICE_TYPE_LABEL,
} from '../api/serviceRequestApi';

const PAGE_SIZE = 10;
const col = createColumnHelper();
const SELECT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

// ─── Format ngày từ ISO string ──────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('vi-VN'); }
  catch { return iso; }
}

// ─── Right drawer ──────────────────────────────────────────
function Drawer({ item, onClose, onUpdate }) {
  const [status,     setStatus]     = useState(item.status);
  const [resultNote, setResultNote] = useState(item.resultNote ?? '');
  const [saving,     setSaving]     = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await serviceRequestApi.updateStatus(item.id, { status, resultNote });
      onUpdate(item.id, status, resultNote);
      toast.success('Đã cập nhật yêu cầu dịch vụ!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  }

  const serviceLabel = SERVICE_TYPE_LABEL[item.serviceType] ?? item.serviceType;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div>
            <p className="font-display font-semibold text-ink">#{item.id}</p>
            <p className="text-xs text-ink-muted mt-0.5">{serviceLabel}</p>
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

          {/* Service type badge */}
          <div className="rounded-xl bg-surface-muted p-4 space-y-1.5">
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Loại dịch vụ</p>
            <p className="font-medium text-ink">{serviceLabel}</p>
            <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>
              {STATUS_LABEL[item.status] ?? item.status}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">Nội dung yêu cầu</p>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
              {item.description || '(Không có mô tả)'}
            </p>
          </div>

          <p className="text-xs text-ink-subtle">
            Ngày gửi: {fmtDate(item.submittedAt)}
            {item.resolvedAt && <span className="ml-3">· Giải quyết: {fmtDate(item.resolvedAt)}</span>}
          </p>

          <div className="border-t border-surface-border" />

          {/* Status update */}
          <div>
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wide block mb-2">
              Cập nhật trạng thái
            </label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={SELECT}>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>

          {/* Result note */}
          <div>
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wide block mb-2">
              Ghi chú kết quả
            </label>
            <textarea
              value={resultNote}
              onChange={e => setResultNote(e.target.value)}
              rows={4}
              placeholder="Nhập ghi chú xử lý..."
              className={`${SELECT} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-surface-border p-4">
          <Button className="w-full justify-center" loading={saving} onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────
export default function ServiceRequestPage() {
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [drawer,      setDrawer]      = useState(null);
  const [page,        setPage]        = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res  = await serviceRequestApi.list(params);
      // ApiResponse<List<ServiceRequestResponse>>
      const data = res.data?.data ?? res.data;
      setRows(Array.isArray(data) ? data : data?.content ?? []);
    } catch (err) {
      toast.error('Không tải được danh sách yêu cầu dịch vụ');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pageData = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleUpdate(id, newStatus, resultNote) {
    setRows(prev => prev.map(r =>
      r.id === id ? { ...r, status: newStatus, resultNote } : r
    ));
    setDrawer(prev => prev?.id === id ? { ...prev, status: newStatus, resultNote } : prev);
  }

  const columns = useMemo(() => [
    col.accessor('id', {
      header: 'Mã YC',
      cell: i => <span className="font-mono text-xs text-ink-subtle">#{i.getValue()}</span>,
    }),
    col.accessor('serviceType', {
      header: 'Loại dịch vụ',
      cell: i => (
        <span className="text-sm text-ink">
          {SERVICE_TYPE_LABEL[i.getValue()] ?? i.getValue()}
        </span>
      ),
    }),
    col.accessor('description', {
      header: 'Mô tả',
      cell: i => (
        <span className="text-sm text-ink-muted line-clamp-2 max-w-[240px]">
          {i.getValue() || '—'}
        </span>
      ),
    }),
    col.accessor('submittedAt', {
      header: 'Ngày gửi',
      cell: i => <span className="text-sm text-ink-muted">{fmtDate(i.getValue())}</span>,
    }),
    col.accessor('status', {
      header: 'Trạng thái',
      cell: i => (
        <Badge variant={STATUS_VARIANT[i.getValue()] ?? 'neutral'}>
          {STATUS_LABEL[i.getValue()] ?? i.getValue()}
        </Badge>
      ),
    }),
    col.display({
      id: 'actions', header: '',
      cell: i => (
        <button
          title="Xem & xử lý"
          onClick={() => setDrawer(i.row.original)}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    }),
  ], []);

  return (
    <div className="space-y-4 max-w-[1200px]">

      {/* Header + refresh */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-ink-muted">Lọc:</span>
          {['', ...ALL_STATUSES].map(s => (
            <button
              key={s || 'all'}
              onClick={() => { setFilterStatus(s); setPage(0); }}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filterStatus === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-muted text-ink-muted hover:bg-surface-hover'}
              `}
            >
              {s ? STATUS_LABEL[s] : 'Tất cả'}
            </button>
          ))}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors disabled:opacity-40"
          title="Tải lại"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pageData}
              emptyState={
                <EmptyState
                  icon={<ClipboardCheck size={36} className="text-ink-subtle" />}
                  title="Không có yêu cầu nào"
                  message="Thử thay đổi bộ lọc hoặc tải lại trang"
                />
              }
            />
            {rows.length > 0 && (
              <div className="border-t border-surface-border px-4">
                <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Drawer */}
      {drawer && (
        <Drawer
          item={rows.find(r => r.id === drawer.id) ?? drawer}
          onClose={() => setDrawer(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}