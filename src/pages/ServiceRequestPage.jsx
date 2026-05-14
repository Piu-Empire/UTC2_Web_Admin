// src/pages/ServiceRequestPage.jsx (ghi đè placeholder)
import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye, X, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable  from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Badge      from '../components/common/Badge';
import Button     from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

// ─── Mock data ─────────────────────────────────────────────
const STATUS_META = {
  'Chờ xử lý':  { variant: 'warning' },
  'Đang xử lý': { variant: 'info'    },
  'Hoàn thành': { variant: 'success' },
  'Từ chối':    { variant: 'error'   },
};
const ALL_STATUSES = Object.keys(STATUS_META);

const INITIAL = [
  { id:1,  code:'YC-001', studentName:'Nguyễn Thị Lan',  studentCode:'23IT1001', serviceType:'Cấp bảng điểm',           desc:'Cần bảng điểm toàn khóa để nộp cho công ty thực tập.', status:'Chờ xử lý',  createdAt:'2025-01-10', resultNote:'' },
  { id:2,  code:'YC-002', studentName:'Vũ Đức Mạnh',     studentCode:'21CE2002', serviceType:'Xác nhận sinh viên',       desc:'Xác nhận đang là sinh viên chính quy để làm hồ sơ vay vốn.', status:'Đang xử lý', createdAt:'2025-01-09', resultNote:'' },
  { id:3,  code:'YC-003', studentName:'Hoàng Anh Tuấn',  studentCode:'22EE3001', serviceType:'Miễn giảm học phí',        desc:'Thuộc diện hộ nghèo, xin xét miễn giảm học phí kỳ 2024-2.', status:'Hoàn thành', createdAt:'2025-01-08', resultNote:'Đã được miễn 50% học phí theo quy định.' },
  { id:4,  code:'YC-004', studentName:'Bùi Thị Ngọc',    studentCode:'23IT1002', serviceType:'Đăng ký học lại',          desc:'Đăng ký học lại môn Kỹ nghệ phần mềm IT3040 kỳ 2025-1.', status:'Chờ xử lý',  createdAt:'2025-01-07', resultNote:'' },
  { id:5,  code:'YC-005', studentName:'Trịnh Văn Phúc',  studentCode:'20CE2001', serviceType:'Xác nhận cư trú KTX',     desc:'Cần giấy xác nhận đang ở KTX để làm thủ tục hộ khẩu tạm trú.', status:'Từ chối',    createdAt:'2025-01-06', resultNote:'Sinh viên không còn ở KTX theo hệ thống.' },
  { id:6,  code:'YC-006', studentName:'Đinh Thị Quỳnh',  studentCode:'22IT1004', serviceType:'Cấp thẻ sinh viên mới',   desc:'Thẻ sinh viên bị mất, cần cấp lại.', status:'Đang xử lý', createdAt:'2025-01-05', resultNote:'' },
  { id:7,  code:'YC-007', studentName:'Lý Thị Uyên',     studentCode:'23CE2001', serviceType:'Chuyển ngành',             desc:'Muốn chuyển từ Cơ khí sang Điện - Điện tử từ học kỳ 2025-2.', status:'Chờ xử lý',  createdAt:'2025-01-04', resultNote:'' },
  { id:8,  code:'YC-008', studentName:'Cao Minh Vũ',     studentCode:'22IT1005', serviceType:'Bảo lưu kết quả học tập', desc:'Xin bảo lưu 1 năm do sức khỏe.', status:'Hoàn thành', createdAt:'2025-01-03', resultNote:'Đã phê duyệt bảo lưu từ HK2025-1 đến HK2026-1.' },
];

const PAGE_SIZE = 8;
const col = createColumnHelper();
const SELECT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

// ─── Right drawer ──────────────────────────────────────────
function Drawer({ item, onClose, onUpdate }) {
  const [status,     setStatus]     = useState(item.status);
  const [resultNote, setResultNote] = useState(item.resultNote);
  const [saving,     setSaving]     = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onUpdate(item.id, status, resultNote);
      toast.success('Đã cập nhật yêu cầu dịch vụ!');
      setSaving(false);
    }, 600);
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <div>
            <p className="font-display font-semibold text-ink">{item.code}</p>
            <p className="text-xs text-ink-muted mt-0.5">{item.serviceType}</p>
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

          {/* Student info */}
          <div className="rounded-xl bg-surface-muted p-4 space-y-1.5">
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Sinh viên</p>
            <p className="font-medium text-ink">{item.studentName}</p>
            <p className="font-mono text-xs text-ink-subtle">{item.studentCode}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">Nội dung yêu cầu</p>
            <p className="text-sm text-ink leading-relaxed">{item.desc}</p>
          </div>

          <p className="text-xs text-ink-subtle">Ngày gửi: {item.createdAt}</p>

          {/* Divider */}
          <div className="border-t border-surface-border" />

          {/* Status update */}
          <div>
            <label className="text-xs font-semibold text-ink-subtle uppercase tracking-wide block mb-2">
              Cập nhật trạng thái
            </label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={SELECT}>
              {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
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
  const [rows,    setRows]    = useState(INITIAL);
  const [status,  setStatus]  = useState('');
  const [drawer,  setDrawer]  = useState(null);
  const [page,    setPage]    = useState(0);

  const filtered = useMemo(() => (
    status ? rows.filter(r => r.status === status) : rows
  ), [rows, status]);

  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleUpdate(id, newStatus, resultNote) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, resultNote } : r));
    setDrawer(prev => prev?.id === id ? { ...prev, status: newStatus, resultNote } : prev);
  }

  const columns = useMemo(() => [
    col.accessor('code', {
      header: 'Mã YC',
      cell: i => <span className="font-mono text-xs text-ink-subtle">{i.getValue()}</span>,
    }),
    col.accessor('studentName', {
      header: 'Sinh viên',
      cell: i => (
        <div>
          <p className="text-sm font-medium text-ink">{i.getValue()}</p>
          <p className="text-xs font-mono text-ink-subtle">{i.row.original.studentCode}</p>
        </div>
      ),
    }),
    col.accessor('serviceType', {
      header: 'Loại dịch vụ',
      cell: i => <span className="text-sm text-ink">{i.getValue()}</span>,
    }),
    col.accessor('createdAt', {
      header: 'Ngày gửi',
      cell: i => <span className="text-sm text-ink-muted">{i.getValue()}</span>,
    }),
    col.accessor('status', {
      header: 'Trạng thái',
      cell: i => <Badge variant={STATUS_META[i.getValue()]?.variant ?? 'neutral'}>{i.getValue()}</Badge>,
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

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-ink-muted">Lọc theo trạng thái:</span>
        {['', ...ALL_STATUSES].map(s => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); setPage(0); }}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${status === s
                ? 'bg-brand-600 text-white'
                : 'bg-surface-muted text-ink-muted hover:bg-surface-hover'}
            `}
          >
            {s || 'Tất cả'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={pageData}
          emptyState={
            <EmptyState
              icon={<ClipboardCheck size={36} className="text-ink-subtle"/>}
              title="Không có yêu cầu nào"
              message="Thử thay đổi bộ lọc trạng thái"
            />
          }
        />
        {filtered.length > 0 && (
          <div className="border-t border-surface-border px-4">
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Right drawer */}
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