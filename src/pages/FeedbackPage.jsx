// src/pages/FeedbackPage.jsx (ghi đè placeholder)
import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge      from '../components/common/Badge';
import Button     from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { initials, timeAgo } from '../utils/formatters';

// ─── Mock data ─────────────────────────────────────────────
const TYPE_META = {
  bug:        { label: 'Báo lỗi', variant: 'error'   },
  suggestion: { label: 'Góp ý',   variant: 'info'    },
  contact:    { label: 'Liên hệ', variant: 'neutral' },
};

const INITIAL = [
  { id:1, studentName:'Nguyễn Văn An',  studentCode:'22IT1001', type:'bug',        status:'unread',   content:'Ứng dụng bị lỗi khi xem thời khóa biểu tuần 15. Màn hình trắng và không hiển thị được dữ liệu.', adminReply:'', createdAt:'2025-01-10T08:30:00' },
  { id:2, studentName:'Trần Thị Bình',  studentCode:'22IT1002', type:'suggestion', status:'replied',  content:'Mong muốn có thể xuất học phí ra file PDF để tiện nộp cho gia đình.', adminReply:'Cảm ơn góp ý! Chúng tôi sẽ xem xét thêm tính năng này trong phiên bản kế tiếp.', createdAt:'2025-01-09T14:20:00' },
  { id:3, studentName:'Lê Hoàng Cường', studentCode:'21CE2001', type:'contact',    status:'unread',   content:'Cần hỗ trợ đăng ký học lại môn Giải tích 1 vì mã môn không tìm thấy trong hệ thống.', adminReply:'', createdAt:'2025-01-09T10:05:00' },
  { id:4, studentName:'Phạm Thu Dung',  studentCode:'22IT1003', type:'bug',        status:'unread',   content:'Điểm môn Vật lý đại cương hiển thị sai so với bảng điểm giấy tôi nhận được.', adminReply:'', createdAt:'2025-01-08T16:45:00' },
  { id:5, studentName:'Đỗ Minh Khoa',   studentCode:'20EE3001', type:'suggestion', status:'replied',  content:'Đề xuất thêm thông báo push khi điểm mới được cập nhật lên hệ thống.', adminReply:'Đã ghi nhận! Tính năng thông báo push đang được phát triển.', createdAt:'2025-01-08T09:00:00' },
];

const FILTER_OPTS = [
  { key: 'all',     label: 'Tất cả'      },
  { key: 'unread',  label: 'Chưa đọc'   },
  { key: 'replied', label: 'Đã phản hồi' },
];

// ─── Left list item ────────────────────────────────────────
function FeedbackItem({ item, active, onClick }) {
  const meta = TYPE_META[item.type] ?? { label: item.type, variant: 'neutral' };
  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-surface-border cursor-pointer transition-colors
        ${active ? 'bg-brand-50' : 'hover:bg-surface-hover'}
        ${item.status === 'unread' ? 'border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'}
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-brand-700">{initials(item.studentName)}</span>
          </div>
          <span className="text-sm font-medium text-ink truncate">{item.studentName}</span>
        </div>
        <span className="text-xs text-ink-subtle flex-shrink-0">{timeAgo(item.createdAt)}</span>
      </div>
      <div className="flex items-center gap-2 mt-1.5 pl-9">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <p className="text-xs text-ink-muted truncate">{item.content}</p>
      </div>
    </div>
  );
}

// ─── Right detail panel ────────────────────────────────────
function FeedbackDetail({ item, onReply }) {
  const [draft, setDraft] = useState(item.adminReply || '');
  const [sending, setSending] = useState(false);
  const meta = TYPE_META[item.type] ?? { label: item.type, variant: 'neutral' };

  function handleSend() {
    if (!draft.trim()) return;
    setSending(true);
    setTimeout(() => {
      onReply(item.id, draft);
      toast.success('Đã gửi phản hồi thành công!');
      setSending(false);
    }, 600);
  }

  return (
    <div className="flex flex-col h-full p-6 gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-ink">{item.studentName}</span>
            <span className="font-mono text-xs text-ink-subtle">{item.studentCode}</span>
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {item.status === 'replied' && <Badge variant="success">Đã phản hồi</Badge>}
          </div>
          <p className="text-xs text-ink-subtle mt-1">{new Date(item.createdAt).toLocaleString('vi-VN')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 overflow-y-auto">
        <div>
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">Nội dung phản hồi</p>
          <p className="text-sm text-ink leading-relaxed">{item.content}</p>
        </div>

        {/* Previous reply */}
        {item.adminReply && (
          <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">Phản hồi của Admin</p>
            <p className="text-sm text-ink leading-relaxed">{item.adminReply}</p>
          </div>
        )}

        {/* Reply box */}
        <div>
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">
            {item.adminReply ? 'Cập nhật phản hồi' : 'Nhập phản hồi'}
          </p>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            placeholder="Nhập phản hồi cho sinh viên..."
            className="w-full border border-surface-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-end mt-2">
            <Button
              icon={<Send size={14}/>}
              loading={sending}
              disabled={!draft.trim()}
              onClick={handleSend}
            >
              Gửi phản hồi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────
export default function FeedbackPage() {
  const [items,    setItems]    = useState(INITIAL);
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);

  function handleReply(id, reply) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, adminReply: reply, status: 'replied' } : i));
    setSelected(prev => prev?.id === id ? { ...prev, adminReply: reply, status: 'replied' } : prev);
  }

  return (
    <div className="card overflow-hidden flex h-[calc(100vh-112px)]">

      {/* ── Left list ── */}
      <div className="w-80 flex-shrink-0 border-r border-surface-border flex flex-col">
        {/* Filter pills */}
        <div className="flex gap-1.5 p-3 border-b border-surface-border flex-wrap">
          {FILTER_OPTS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { setFilter(opt.key); setSelected(null); }}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${filter === opt.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-muted text-ink-muted hover:bg-surface-hover'}
              `}
            >
              {opt.label}
              {opt.key === 'unread' && (
                <span className="ml-1.5 bg-white/25 rounded-full px-1">
                  {items.filter(i => i.status === 'unread').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-10">Không có phản hồi nào.</p>
          ) : (
            filtered.map(item => (
              <FeedbackItem
                key={item.id}
                item={item}
                active={selected?.id === item.id}
                onClick={() => setSelected(item)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right detail ── */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <FeedbackDetail
            key={selected.id}
            item={items.find(i => i.id === selected.id) ?? selected}
            onReply={handleReply}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={<MessageSquare size={36} className="text-ink-subtle"/>}
              title="Chọn một phản hồi"
              message="Nhấn vào phản hồi bên trái để xem chi tiết và trả lời"
            />
          </div>
        )}
      </div>
    </div>
  );
}