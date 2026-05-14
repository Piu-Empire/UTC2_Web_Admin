// src/pages/DashboardPage.jsx
import { useNavigate } from 'react-router-dom';
import {
  Users, Bell, MessageSquare, ClipboardList,
  BookOpen, CalendarDays, Wallet, GraduationCap, FileSpreadsheet,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge    from '../components/common/Badge';

// ─── Mock data ───────────────────────────────────────────

const MOCK_STATS = {
  totalStudents:   12480,
  unreadNotifs:    24,
  pendingFeedback: 7,
  pendingRequests: 13,
};

const MOCK_FEEDBACKS = [
  { id: 1, studentName: 'Nguyễn Văn An',  type: 'bug',        content: 'Ứng dụng bị lỗi khi xem thời khóa biểu tuần 15.', createdAt: '2025-01-10T08:30:00' },
  { id: 2, studentName: 'Trần Thị Bình',  type: 'suggestion', content: 'Mong muốn có thể xuất học phí ra PDF.',             createdAt: '2025-01-09T14:20:00' },
  { id: 3, studentName: 'Lê Hoàng Cường', type: 'contact',    content: 'Cần hỗ trợ đăng ký học lại môn Giải tích 1.',      createdAt: '2025-01-09T10:05:00' },
  { id: 4, studentName: 'Phạm Thu Dung',  type: 'bug',        content: 'Điểm môn Vật lý hiển thị sai so với bảng điểm.',   createdAt: '2025-01-08T16:45:00' },
  { id: 5, studentName: 'Đỗ Minh Khoa',   type: 'suggestion', content: 'Thêm thông báo khi điểm được cập nhật.',           createdAt: '2025-01-08T09:00:00' },
];

const MOCK_REQUESTS = [
  { id: 1, studentName: 'Nguyễn Thị Lan',  serviceType: 'Cấp bảng điểm',           status: 'pending'    },
  { id: 2, studentName: 'Vũ Đức Mạnh',     serviceType: 'Xác nhận sinh viên',       status: 'processing' },
  { id: 3, studentName: 'Hoàng Anh Tuấn',  serviceType: 'Miễn giảm học phí',        status: 'done'       },
  { id: 4, studentName: 'Bùi Thị Ngọc',    serviceType: 'Đăng ký học lại',          status: 'pending'    },
  { id: 5, studentName: 'Trịnh Văn Phúc',  serviceType: 'Xác nhận cư trú KTX',      status: 'rejected'   },
];

// ─── Config ──────────────────────────────────────────────

const STAT_CARDS = [
  { icon: <Users size={20}/>,         iconBg: 'bg-brand-50',   iconColor: 'text-brand-600',   value: MOCK_STATS.totalStudents,   label: 'Tổng sinh viên'      },
  { icon: <Bell size={20}/>,          iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   value: MOCK_STATS.unreadNotifs,    label: 'Thông báo chưa đọc'  },
  { icon: <MessageSquare size={20}/>, iconBg: 'bg-rose-50',    iconColor: 'text-rose-600',    value: MOCK_STATS.pendingFeedback, label: 'Phản hồi chờ xử lý' },
  { icon: <ClipboardList size={20}/>, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: MOCK_STATS.pendingRequests, label: 'Yêu cầu dịch vụ'    },
];

const IMPORTS = [
  { to: '/import/students',    Icon: Users,           title: 'Sinh viên',       sub: 'USER + STUDENT_PROFILE' },
  { to: '/import/courses',     Icon: BookOpen,        title: 'Học phần',        sub: 'COURSE'                 },
  { to: '/import/enrollments', Icon: FileSpreadsheet, title: 'Đăng ký & Điểm', sub: 'ENROLLMENT'             },
  { to: '/import/schedules',   Icon: CalendarDays,    title: 'Thời khóa biểu', sub: 'SCHEDULE'               },
  { to: '/import/fees',        Icon: Wallet,          title: 'Học phí',         sub: 'FEE'                    },
  { to: '/import/curriculum',  Icon: GraduationCap,   title: 'Chương trình ĐT', sub: 'CURRICULUM'             },
];

const FEEDBACK_TYPE = {
  bug:        { label: 'Báo lỗi', variant: 'error'   },
  suggestion: { label: 'Góp ý',   variant: 'info'    },
  contact:    { label: 'Liên hệ', variant: 'neutral' },
};

const SR_STATUS = {
  pending:    { label: 'Chờ xử lý',  variant: 'warning' },
  processing: { label: 'Đang xử lý', variant: 'info'    },
  done:       { label: 'Hoàn thành', variant: 'success' },
  rejected:   { label: 'Từ chối',    variant: 'error'   },
};

// ─── Helpers ─────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Vừa xong';
  if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function Avatar({ name }) {
  const letters = name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-brand-700">{letters}</span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Quick import */}
      <section>
        <p className="font-display font-semibold text-base text-ink mb-3">
          Import dữ liệu nhanh
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {IMPORTS.map(({ to, Icon, title, sub }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card card-hover p-4 flex items-center gap-3 text-left w-full"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-ink-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{title}</p>
                <p className="text-xs text-ink-muted">{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recent activity — 60 / 40 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Recent feedbacks */}
        <div className="lg:col-span-3 card p-5">
          <p className="font-display font-semibold text-[15px] text-ink mb-4">Phản hồi gần đây</p>
          <div className="divide-y divide-surface-border">
            {MOCK_FEEDBACKS.map(fb => {
              const t = FEEDBACK_TYPE[fb.type] ?? { label: fb.type, variant: 'neutral' };
              return (
                <div key={fb.id} className="flex items-start gap-3 py-3">
                  <Avatar name={fb.studentName} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-ink">{fb.studentName}</span>
                      <Badge variant={t.variant}>{t.label}</Badge>
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-1">{fb.content}</p>
                  </div>
                  <span className="text-xs text-ink-subtle whitespace-nowrap flex-shrink-0 pt-0.5">
                    {timeAgo(fb.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service requests */}
        <div className="lg:col-span-2 card p-5">
          <p className="font-display font-semibold text-[15px] text-ink mb-4">Yêu cầu dịch vụ</p>
          <div className="divide-y divide-surface-border">
            {MOCK_REQUESTS.map(sr => {
              const s = SR_STATUS[sr.status] ?? { label: sr.status, variant: 'neutral' };
              return (
                <div key={sr.id} className="flex items-center gap-3 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{sr.studentName}</p>
                    <p className="text-xs text-ink-muted truncate">{sr.serviceType}</p>
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}