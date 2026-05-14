import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Upload, BookOpen, ClipboardList,
  CalendarDays, Wallet, GraduationCap, Bell, MessageSquare,
  ClipboardCheck, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';

// ─── Nav data ────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/',         icon: LayoutDashboard, label: 'Dashboard',   exact: true },
      { to: '/students', icon: Users,           label: 'Sinh viên' },
    ],
  },
  {
    label: 'Import',
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
    label: 'Quản lý',
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

// ─── Component ───────────────────────────────────────────
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
    catch { return {}; }
  })();
  const initials = (user.name || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside
      className={`
        flex flex-col h-screen bg-white dark:bg-slate-900 border-r border-surface-border dark:border-slate-800
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* ── Logo ── */}
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

      {/* ── Nav groups ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {/* Section label */}
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle px-3 mb-1 font-body">
                {group.label}
              </p>
            )}

            {group.items.map(({ to, icon: Icon, label, exact }) => {
              // Active: exact match for dashboard, startsWith for others
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
                  <Icon
                    size={18}
                    className={`nav-icon flex-shrink-0 ${isActive ? 'text-brand-600' : 'text-ink-subtle'}`}
                  />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: user row + collapse button ── */}
      <div className="border-t border-surface-border dark:border-slate-800">
        {/* User row */}
        <div
          className={`
            h-14 flex items-center gap-3 px-3 overflow-hidden
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-semibold text-brand-700 text-xs">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate leading-tight">
                {user.name || 'Admin'}
              </p>
              <p className="text-xs text-ink-subtle truncate">Quản trị viên</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="
            w-full h-9 flex items-center justify-center
            text-ink-subtle hover:text-ink hover:bg-surface-hover
            transition-colors border-t border-surface-border dark:border-slate-800
          "
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}