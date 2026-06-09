import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Bell, MessageSquare, ClipboardList,
  BookOpen, CalendarDays, Wallet, GraduationCap,
  FileSpreadsheet, UserRound,
  BarChart2, Trophy, Award, ShieldAlert, Star,
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge    from '../components/common/Badge';
import { studentApi }       from '../api/studentApi';
import { feedbackApi,
         STATUS_VARIANT as FB_STATUS_VARIANT,
         STATUS_LABEL   as FB_STATUS_LABEL,
         TYPE_LABEL }        from '../api/feedbackApi';
import { serviceRequestApi,
         STATUS_LABEL   as SR_STATUS_LABEL,
         STATUS_VARIANT as SR_STATUS_VARIANT } from '../api/serviceRequestApi';

// ─── Permission helper ────────────────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
  catch { return {}; }
}

function canSee(section, role, staffLevel) {
  if (role === 'ADMIN') return true;
  switch (section) {
    case 'academic':
      return role === 'ADVISOR' || (role === 'STAFF' && staffLevel >= 2);
    case 'assessment':
      // advisor + lv1, lv3, lv4, lv5 (không lv2, không null)
      if (role === 'ADVISOR') return true;
      if (role === 'STAFF' && (staffLevel === 1 || staffLevel >= 3)) return true;
      return false;
    case 'lv5':
      return role === 'STAFF' && staffLevel >= 5;
    default:
      return false;
  }
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const IMPORTS = [
  { to: '/import/students',    Icon: Users,           title: 'Sinh viên',        sub: 'USER + STUDENT_PROFILE' },
  { to: '/import/profiles',    Icon: UserRound,       title: 'Cập nhật Profile',  sub: 'STUDENT_PROFILE'        },
  { to: '/import/courses',     Icon: BookOpen,        title: 'Học phần',          sub: 'COURSE'                 },
  { to: '/import/enrollments', Icon: FileSpreadsheet, title: 'Đăng ký & Điểm',   sub: 'ENROLLMENT'             },
  { to: '/import/schedules',   Icon: CalendarDays,    title: 'Thời khóa biểu',   sub: 'SCHEDULE'               },
  { to: '/import/fees',        Icon: Wallet,          title: 'Học phí',           sub: 'FEE'                    },
  { to: '/import/curriculum',  Icon: GraduationCap,   title: 'Chương trình ĐT',  sub: 'CURRICULUM'             },
];

const ACADEMIC_SHORTCUTS = [
  { to: '/academic/results',      Icon: BarChart2,   title: 'Kết quả học tập',    sub: 'Xem điểm sinh viên'         },
  { to: '/academic/leaderboard',  Icon: Trophy,      title: 'Bảng xếp hạng',      sub: 'Top sinh viên GPA cao'      },
  { to: '/academic/scholarships', Icon: Award,       title: 'Học bổng',            sub: 'Quản lý học bổng'           },
  { to: '/academic/warnings',     Icon: ShieldAlert, title: 'Cảnh báo học vụ',    sub: 'Sinh viên có cảnh báo'      },
];

const ASSESSMENT_SHORTCUT = {
  to: '/assessment', Icon: Star, title: 'Đánh giá rèn luyện', sub: 'Xem & duyệt đánh giá',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Vừa xong';
  if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

function Avatar({ name }) {
  const letters = (name || '?').split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-brand-700">{letters}</span>
    </div>
  );
}

function ShortcutCard({ to, Icon, title, sub, onClick }) {
  return (
    <button
      onClick={() => onClick(to)}
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
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getUser();
  const { role, staffLevel } = user;

  const showAcademic   = canSee('academic',   role, staffLevel);
  const showAssessment = canSee('assessment', role, staffLevel);
  const showLv5        = canSee('lv5',        role, staffLevel);

  const academicItems =
    role === 'ADVISOR'
      // Advisor: leaderboard xem, warning + scholarship dùng advisor routes
      ? [
          { to: '/academic/leaderboard',          Icon: Trophy,      title: 'Bảng xếp hạng',   sub: 'Top sinh viên GPA cao' },
          { to: '/academic/advisor/warnings',     Icon: ShieldAlert, title: 'Cảnh báo học vụ', sub: 'Quản lý cảnh báo sinh viên' },
          { to: '/academic/advisor/scholarships', Icon: Award,       title: 'Học bổng',         sub: 'Cập nhật trạng thái học bổng' },
        ]
      : (role === 'STAFF' && staffLevel === 2)
      // Giảng viên lv2: chỉ kết quả học tập (trang grades, có nút edit)
      ? [{ to: '/academic/grades', Icon: BarChart2, title: 'Kết quả học tập', sub: 'Xem và nhập điểm theo môn' }]
      // lv3+ và admin: đầy đủ
      : ACADEMIC_SHORTCUTS;

  const [stats,    setStats]    = useState({ totalStudents: 0, unreadNotifs: 0, pendingFeedback: 0, pendingRequests: 0 });
  const [feedbacks,  setFeedbacks]  = useState([]);
  const [requests,   setRequests]   = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!showLv5) { setLoadingStats(false); return; }
    async function load() {
      setLoadingStats(true);
      try {
        const [svRes, fbRes, srRes] = await Promise.allSettled([
          studentApi.list({ page: 0, size: 1 }),
          feedbackApi.list({ status: 'UNREAD', page: 0, size: 5 }),
          serviceRequestApi.list({ status: 'PENDING', page: 0, size: 5 }),
        ]);
        const svData = svRes.status === 'fulfilled' ? (svRes.value?.data?.data ?? svRes.value?.data) : null;
        const totalStudents = svData?.totalElements ?? svData?.total ?? 0;
        const fbData = fbRes.status === 'fulfilled' ? (fbRes.value?.data?.data ?? fbRes.value?.data) : null;
        const fbList = Array.isArray(fbData) ? fbData : (fbData?.content ?? []);
        setFeedbacks(fbList.slice(0, 5));
        const srData = srRes.status === 'fulfilled' ? (srRes.value?.data?.data ?? srRes.value?.data) : null;
        const srList = Array.isArray(srData) ? srData : (srData?.content ?? []);
        setRequests(srList.slice(0, 5));
        setStats({
          totalStudents,
          unreadNotifs: 0,
          pendingFeedback: fbData?.totalElements ?? fbList.length,
          pendingRequests: srData?.totalElements ?? srList.length,
        });
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoadingStats(false);
      }
    }
    load();
  }, [showLv5]);

  const STAT_CARDS = [
    { icon: <Users size={20}/>,         iconBg: 'bg-brand-50',   iconColor: 'text-brand-600',   value: stats.totalStudents,   label: 'Tổng sinh viên'      },
    { icon: <Bell size={20}/>,          iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   value: stats.unreadNotifs,    label: 'Thông báo chưa đọc'  },
    { icon: <MessageSquare size={20}/>, iconBg: 'bg-rose-50',    iconColor: 'text-rose-600',    value: stats.pendingFeedback, label: 'Phản hồi chờ xử lý'  },
    { icon: <ClipboardList size={20}/>, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', value: stats.pendingRequests, label: 'Yêu cầu dịch vụ'     },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Stat cards — chỉ lv5+ */}
      {showLv5 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} {...card} index={i} loading={loadingStats} />
          ))}
        </div>
      )}

      {/* Shortcuts kết quả học tập — lv2+ và advisor */}
      {showAcademic && (
        <section>
          <p className="font-display font-semibold text-base text-ink mb-3">Kết quả học tập</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {academicItems.map(item => (
              <ShortcutCard key={item.to} {...item} onClick={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* Shortcut đánh giá rèn luyện — advisor + lv3+ */}
      {showAssessment && (
        <section>
          <p className="font-display font-semibold text-base text-ink mb-3">Đánh giá rèn luyện</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <ShortcutCard {...ASSESSMENT_SHORTCUT} onClick={navigate} />
          </div>
        </section>
      )}

      {/* Import nhanh — chỉ lv5+ */}
      {showLv5 && (
        <section>
          <p className="font-display font-semibold text-base text-ink mb-3">Import dữ liệu nhanh</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {IMPORTS.map(({ to, Icon, title, sub }) => (
              <ShortcutCard key={to} to={to} Icon={Icon} title={title} sub={sub} onClick={navigate} />
            ))}
          </div>
        </section>
      )}

      {/* Recent activity — chỉ lv5+ */}
      {showLv5 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 card p-5">
            <p className="font-display font-semibold text-[15px] text-ink mb-4">Phản hồi chưa đọc</p>
            {feedbacks.length === 0 ? (
              <p className="text-sm text-ink-muted py-4 text-center">Không có phản hồi mới</p>
            ) : (
              <div className="divide-y divide-surface-border">
                {feedbacks.map(fb => {
                  const t = TYPE_LABEL[fb.type] ?? { label: fb.type, variant: 'neutral' };
                  return (
                    <div key={fb.id} className="flex items-start gap-3 py-3">
                      <Avatar name={fb.studentName ?? fb.studentCode ?? '?'} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-medium text-ink">
                            {fb.studentName ?? fb.studentCode ?? `#${fb.id}`}
                          </span>
                          <Badge variant={t.variant}>{t.label}</Badge>
                        </div>
                        <p className="text-xs text-ink-muted line-clamp-1">{fb.content}</p>
                      </div>
                      <span className="text-xs text-ink-subtle whitespace-nowrap flex-shrink-0 pt-0.5">
                        {timeAgo(fb.submittedAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 card p-5">
            <p className="font-display font-semibold text-[15px] text-ink mb-4">Yêu cầu chờ xử lý</p>
            {requests.length === 0 ? (
              <p className="text-sm text-ink-muted py-4 text-center">Không có yêu cầu mới</p>
            ) : (
              <div className="divide-y divide-surface-border">
                {requests.map(sr => {
                  const s = SR_STATUS_LABEL[sr.status]
                    ? { label: SR_STATUS_LABEL[sr.status], variant: SR_STATUS_VARIANT[sr.status] }
                    : { label: sr.status, variant: 'neutral' };
                  return (
                    <div key={sr.id} className="flex items-center gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {sr.studentName ?? sr.studentCode ?? `#${sr.id}`}
                        </p>
                        <p className="text-xs text-ink-muted truncate">{sr.serviceType}</p>
                      </div>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}