import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Upload, BookOpen, ClipboardList,
  CalendarDays, Wallet, GraduationCap, Bell, MessageSquare,
  ClipboardCheck, ChevronLeft, ChevronRight, LogOut,
  BarChart2, Trophy, Award, ShieldAlert, Star,
} from 'lucide-react';

// ─── Permission helpers ───────────────────────────────────────────────────────

function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
  catch { return {}; }
}

/**
 * Kiểm tra user có được thấy section không.
 * role: 'ADMIN' | 'ADVISOR' | 'STAFF' | 'STUDENT'
 * staffLevel: 1 | 2 | 3 | 4 | 5 | null
 */
function canSee(section, role, staffLevel) {
  if (role === 'ADMIN') return true;

  switch (section) {
    case 'dashboard':
      if (role === 'ADVISOR') return true;
      if (role === 'STAFF' && staffLevel >= 2) return true;
      return false;

    case 'assessment':
      if (role === 'ADVISOR') return true;
      if (role === 'STAFF') return true;
      return false;

    case 'academic_results':
      // Kết quả học tập: lv2+
      if (role === 'STAFF' && staffLevel >= 2) return true;
      return false;

    case 'academic_advanced':
      // Học bổng, bảng xếp hạng, cảnh báo: lv3+ và advisor
      if (role === 'ADVISOR') return true;
      if (role === 'STAFF' && staffLevel >= 3) return true;
      return false;

    case 'lv5':
      if (role === 'STAFF' && staffLevel >= 5) return true;
      return false;

    default:
      return false;
  }
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Main',
    section: 'dashboard',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    ],
  },
  {
    label: 'Kết quả học tập',
    section: 'academic_results',
    items: [
      { to: '/academic/results', icon: BarChart2, label: 'Kết quả' },
    ],
  },
  {
    label: 'Học thuật',
    section: 'academic_advanced',
    items: [
      { to: '/academic/leaderboard',  icon: Trophy,      label: 'Bảng xếp hạng' },
      { to: '/academic/scholarships', icon: Award,       label: 'Học bổng' },
      { to: '/academic/warnings',     icon: ShieldAlert, label: 'Cảnh báo học vụ' },
    ],
  },
  {
    label: 'Quản lý',
    section: 'assessment',
    items: [
      { to: '/assessment', icon: Star, label: 'Đánh giá rèn luyện' },
    ],
  },
  {
    label: 'Sinh viên',
    section: 'lv5',
    items: [
      { to: '/students', icon: Users, label: 'Sinh viên' },
    ],
  },
  {
    label: 'Import',
    section: 'lv5',
    items: [
      { to: '/import/students',    icon: Upload,        label: 'Sinh viên' },
      { to: '/import/courses',     icon: BookOpen,      label: 'Học phần' },
      { to: '/import/enrollments', icon: ClipboardList, label: 'Đăng ký & Điểm' },
      { to: '/import/schedules',   icon: CalendarDays,  label: 'Thời khóa biểu' },
      { to: '/import/fees',        icon: Wallet,        label: 'Học phí' },
      { to: '/import/curriculum',  icon: GraduationCap, label: 'Chương trình ĐT' },
    ],
  },
  {
    label: 'Tiện ích',
    section: 'lv5',
    items: [
      { to: '/notifications',    icon: Bell,           label: 'Thông báo' },
      { to: '/feedback',         icon: MessageSquare,  label: 'Phản hồi' },
      { to: '/service-requests', icon: ClipboardCheck, label: 'Yêu cầu dịch vụ' },
    ],
  },
];

function handleLogout() {
  localStorage.removeItem('utc2_token');
  localStorage.removeItem('utc2_user');
  window.location.href = '/login';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = getUser();
  const { role, staffLevel } = user;

  const visibleGroups = NAV_GROUPS.filter(g => canSee(g.section, role, staffLevel));

  const initials = (user.name || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Label vai trò hiển thị ở bottom
  function roleLabel() {
    if (role === 'ADMIN')   return 'Quản trị viên';
    if (role === 'ADVISOR') return 'Cố vấn học tập';
    if (role === 'STAFF') {
      const map = { 1: 'Tập thể lớp', 2: 'Giảng viên', 3: 'Bộ môn', 4: 'Khoa', 5: 'Phòng giáo vụ' };
      return map[staffLevel] ?? 'Staff';
    }
    return 'Người dùng';
  }

  return (
    <aside className={`
      flex flex-col h-screen bg-white dark:bg-slate-900
      border-r border-surface-border dark:border-slate-800
      transition-all duration-300 ease-in-out flex-shrink-0
      ${collapsed ? 'w-16' : 'w-60'}
    `}>
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-surface-border dark:border-slate-800 px-3 gap-3 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-white text-[18px] leading-none">U</span>
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-ink text-[15px] whitespace-nowrap">
            UTC2 Admin
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {visibleGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle px-3 mb-1 font-body">
                {group.label}
              </p>
            )}
            {group.items.map(({ to, icon: Icon, label, exact }) => {
              const isActive = exact
                ? location.pathname === to
                : location.pathname.startsWith(to);
              return (
                <NavLink
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={18} className={`nav-icon flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-ink-subtle'}`} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-surface-border dark:border-slate-800">
        <div className={`h-14 flex items-center gap-3 px-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-semibold text-brand-700 text-xs">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate leading-tight">{user.name || 'Admin'}</p>
              <p className="text-xs text-ink-subtle truncate">{roleLabel()}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} title="Đăng xuất"
              className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors">
              <LogOut size={15} />
            </button>
          )}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full h-9 flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-surface-hover transition-colors border-t border-surface-border dark:border-slate-800"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}