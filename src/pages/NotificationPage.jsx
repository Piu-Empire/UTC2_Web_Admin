// src/pages/NotificationPage.jsx (ghi đè placeholder)
import { useState, useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Plus, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable  from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import Badge      from '../components/common/Badge';
import Button     from '../components/common/Button';
import Modal      from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import { timeAgo } from '../utils/formatters';

// ─── Mock data ─────────────────────────────────────────────
const TYPE_VARIANT = {
  'Hệ thống': 'neutral', 'Học phí': 'warning',
  'Cảnh báo': 'error',   'Lịch học': 'info', 'Deadline': 'error',
};

const INITIAL = [
  { id:1, title:'Thông báo nghỉ lễ 30/4',        recipient:'Toàn bộ sinh viên', type:'Hệ thống', status:'Đã gửi',  sentAt:'2025-04-25T08:00:00' },
  { id:2, title:'Nhắc đóng học phí kỳ 2024-2',   recipient:'Toàn bộ sinh viên', type:'Học phí',  status:'Đã gửi',  sentAt:'2025-03-10T09:00:00' },
  { id:3, title:'Cảnh báo điểm rèn luyện thấp',  recipient:'Khoa Cơ khí',       type:'Cảnh báo', status:'Đã gửi',  sentAt:'2025-02-20T10:30:00' },
  { id:4, title:'Điều chỉnh TKB tuần 12',        recipient:'Khoa Công nghệ TT', type:'Lịch học', status:'Đã gửi',  sentAt:'2025-01-15T07:00:00' },
  { id:5, title:'Hạn nộp đề cương NCKH',         recipient:'SV Nguyễn Văn An',  type:'Deadline', status:'Chờ gửi', sentAt:null                  },
];

const TYPES   = ['Hệ thống','Học phí','Cảnh báo','Lịch học','Deadline'];
const PAGE_SIZE = 10;
const col = createColumnHelper();

// ─── Create modal form ─────────────────────────────────────
function CreateModal({ open, onClose, onSubmit }) {
  const [recipientType, setRecipientType] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [faculty,       setFaculty]       = useState('');
  const [title,         setTitle]         = useState('');
  const [content,       setContent]       = useState('');
  const [type,          setType]          = useState('Hệ thống');
  const [scheduled,     setScheduled]     = useState(false);
  const [scheduleAt,    setScheduleAt]    = useState('');

  function buildRecipient() {
    if (recipientType === 'one')    return studentSearch || 'Một sinh viên';
    if (recipientType === 'faculty') return faculty || 'Theo khoa';
    return 'Toàn bộ sinh viên';
  }

  function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, type, recipient: buildRecipient(), sentAt: scheduled ? scheduleAt : new Date().toISOString() });
    onClose();
    setTitle(''); setContent(''); setStudentSearch(''); setScheduled(false); setScheduleAt('');
  }

  const INPUT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
  const RADIO = 'flex items-center gap-2 text-sm cursor-pointer';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo thông báo mới"
      maxWidth="max-w-lg"
      footer={
        <>
          <Button variant="outlined" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>Gửi ngay</Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Recipient type */}
        <div>
          <p className="text-sm font-medium text-ink mb-2">Người nhận</p>
          <div className="flex gap-4 flex-wrap">
            {[['all','Toàn bộ sinh viên'],['one','Một sinh viên'],['faculty','Theo khoa']].map(([v,l]) => (
              <label key={v} className={RADIO}>
                <input type="radio" value={v} checked={recipientType === v}
                  onChange={() => setRecipientType(v)} className="text-brand-600" />
                {l}
              </label>
            ))}
          </div>
          {recipientType === 'one' && (
            <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
              placeholder="Nhập MSSV hoặc tên sinh viên..." className={`${INPUT} mt-2`} />
          )}
          {recipientType === 'faculty' && (
            <select value={faculty} onChange={e => setFaculty(e.target.value)} className={`${INPUT} mt-2`}>
              <option value="">Chọn khoa...</option>
              {['Công nghệ TT','Cơ khí','Điện - Điện tử'].map(f => <option key={f}>{f}</option>)}
            </select>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Tiêu đề</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Tiêu đề thông báo..." className={INPUT} />
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Nội dung</label>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            rows={4} placeholder="Nội dung thông báo..." className={`${INPUT} resize-none`} />
        </div>

        {/* Type */}
        <div>
          <label className="text-sm font-medium text-ink block mb-1">Loại</label>
          <select value={type} onChange={e => setType(e.target.value)} className={INPUT}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Schedule */}
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={scheduled} onChange={e => setScheduled(e.target.checked)}
            className="rounded border-surface-border text-brand-600" />
          Lên lịch gửi
        </label>
        {scheduled && (
          <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
            className={INPUT} />
        )}
      </div>
    </Modal>
  );
}

// ─── Page ──────────────────────────────────────────────────
export default function NotificationPage() {
  const [rows,     setRows]     = useState(INITIAL);
  const [modalOpen,setModal]    = useState(false);
  const [page,     setPage]     = useState(0);

  function handleCreate(data) {
    toast.success('Thông báo đã được tạo!'); setRows(prev => [{ id: Date.now(), status: data.sentAt ? 'Đã gửi' : 'Chờ gửi', ...data }, ...prev]);
  }

  const pageData = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const columns = useMemo(() => [
    col.accessor('title', {
      header: 'Tiêu đề',
      cell: i => <span className="font-medium text-ink text-sm">{i.getValue()}</span>,
    }),
    col.accessor('recipient', { header: 'Người nhận' }),
    col.accessor('type', {
      header: 'Loại',
      cell: i => <Badge variant={TYPE_VARIANT[i.getValue()] ?? 'neutral'}>{i.getValue()}</Badge>,
    }),
    col.accessor('status', {
      header: 'Trạng thái',
      cell: i => <Badge variant={i.getValue() === 'Đã gửi' ? 'success' : 'warning'}>{i.getValue()}</Badge>,
    }),
    col.accessor('sentAt', {
      header: 'Thời gian gửi',
      cell: i => i.getValue() ? <span className="text-sm text-ink-muted">{timeAgo(i.getValue())}</span> : <span className="text-ink-subtle">—</span>,
    }),
  ], []);

  return (
    <div className="space-y-4 max-w-[1200px]">
      <div className="flex justify-end">
        <Button icon={<Plus size={15}/>} onClick={() => setModal(true)}>Tạo thông báo</Button>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={pageData}
          emptyState={<EmptyState icon={<Bell size={36} className="text-ink-subtle"/>} title="Chưa có thông báo nào" />}
        />
        {rows.length > 0 && (
          <div className="border-t border-surface-border px-4">
            <Pagination page={page} total={rows.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        )}
      </div>

      <CreateModal open={modalOpen} onClose={() => setModal(false)} onSubmit={handleCreate} />
    </div>
  );
}