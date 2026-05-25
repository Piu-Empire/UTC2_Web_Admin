import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge      from '../components/common/Badge';
import Button     from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Skeleton   from '../components/common/Skeleton';
import { feedbackApi, STATUS_LABEL, STATUS_VARIANT, TYPE_LABEL } from '../api/feedbackApi';
import { initials, timeAgo } from '../utils/formatters';

// ─── Helpers ───────────────────────────────────────────────
const FILTER_OPTS = [
  { key: 'all',          label: 'Tất cả'       },
  { key: 'chưa đọc',    label: 'Chưa đọc'     },
  { key: 'đã phản hồi', label: 'Đã phản hồi'  },
];

function typeMeta(type) {
  return TYPE_LABEL[type] ?? { label: type, variant: 'neutral' };
}

// ─── Left list item ────────────────────────────────────────
function FeedbackItem({ item, active, onClick }) {
  const meta = typeMeta(item.type);
  const unread = item.status === 'chưa đọc';
  return (
    <div
      onClick={onClick}
      className={`
        p-4 border-b border-surface-border cursor-pointer transition-colors
        ${active  ? 'bg-brand-50' : 'hover:bg-surface-hover'}
        ${unread  ? 'border-l-4 border-l-brand-600' : 'border-l-4 border-l-transparent'}
      `}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-bold text-brand-700">
              {initials(item.studentName ?? '?')}
            </span>
          </div>
          <span className="text-sm font-medium text-ink truncate">
            {item.studentName ?? item.studentCode ?? `#${item.id}`}
          </span>
        </div>
        <span className="text-xs text-ink-subtle flex-shrink-0">{timeAgo(item.submittedAt)}</span>
      </div>
      <div className="flex items-center gap-2 mt-1.5 pl-9">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <p className="text-xs text-ink-muted truncate">{item.content}</p>
      </div>
    </div>
  );
}

// ─── Right detail panel ────────────────────────────────────
function FeedbackDetail({ item, onReplied }) {
  const [draft,   setDraft]   = useState(item.adminReply ?? '');
  const [sending, setSending] = useState(false);
  const meta = typeMeta(item.type);

  // sync draft khi chọn item khác
  useEffect(() => { setDraft(item.adminReply ?? ''); }, [item.id]);

  async function handleSend() {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await feedbackApi.reply(item.id, draft.trim());
      toast.success('Đã gửi phản hồi thành công!');
      onReplied(item.id, draft.trim());
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Gửi thất bại');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full p-6 gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-semibold text-ink">
              {item.studentName ?? 'Sinh viên'}
            </span>
            {item.studentCode && (
              <span className="font-mono text-xs text-ink-subtle">{item.studentCode}</span>
            )}
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <Badge variant={STATUS_VARIANT[item.status] ?? 'neutral'}>
              {STATUS_LABEL[item.status] ?? item.status}
            </Badge>
          </div>
          <p className="text-xs text-ink-subtle mt-1">
            {item.submittedAt ? new Date(item.submittedAt).toLocaleString('vi-VN') : ''}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 overflow-y-auto">
        <div>
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">
            Nội dung phản hồi
          </p>
          <p className="text-sm text-ink leading-relaxed">{item.content}</p>
        </div>

        {/* Previous reply */}
        {item.adminReply && (
          <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
            <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">
              Phản hồi của Admin
            </p>
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
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await feedbackApi.list(params);
      // backend trả ApiResponse<List> → res.data.data
      const list = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Không thể tải danh sách phản hồi');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Khi admin gửi reply → cập nhật local state
  function handleReplied(id, adminReply) {
    setItems(prev =>
      prev.map(i => i.id === id
        ? { ...i, adminReply, status: 'đã phản hồi' }
        : i
      )
    );
    setSelected(prev =>
      prev?.id === id ? { ...prev, adminReply, status: 'đã phản hồi' } : prev
    );
  }

  const unreadCount = items.filter(i => i.status === 'chưa đọc').length;

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
              {opt.key === 'chưa đọc' && unreadCount > 0 && (
                <span className="ml-1.5 bg-white/25 rounded-full px-1">{unreadCount}</span>
              )}
            </button>
          ))}

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="ml-auto p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-10">Không có phản hồi nào.</p>
          ) : (
            items.map(item => (
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
            onReplied={handleReplied}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon={<MessageSquare size={36} className="text-ink-subtle" />}
              title="Chọn một phản hồi"
              message="Nhấn vào phản hồi bên trái để xem chi tiết và trả lời"
            />
          </div>
        )}
      </div>
    </div>
  );
}