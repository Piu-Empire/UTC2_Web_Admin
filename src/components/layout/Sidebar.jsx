import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { exportEnrollments, exportDormitory } from '../../api/exportApi';
import {
  LayoutDashboard, Users, Trophy, Upload, BookOpen, ClipboardList,
  CalendarDays, Wallet, GraduationCap, Bell, MessageSquare,
  ClipboardCheck, ChevronLeft, ChevronRight, LogOut, BarChart2,
  Star, Building2, Award, ShieldAlert, UserCircle, Download
} from 'lucide-react';

// ─── Permission helpers ───────────────────────────────────────────────────────

function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
  catch { return {}; }
}

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
      if (role === 'STAFF' && staffLevel >= 2) return true;
      return false;

    case 'academic_advanced':
      if (role === 'ADVISOR') return true;
      if (role === 'STAFF' && staffLevel >= 3) return true;
      return false;

    case 'lv5':
      // lv5 restricted chỉ thấy section riêng, không thấy section lv5 chung
      if (role === 'STAFF' && staffLevel === 5) return false;
      if (role === 'STAFF' && staffLevel >= 5) return true;
      return false;

    case 'lv5_restricted':
      if (role === 'STAFF' && staffLevel === 5) return true;
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
      { to: '/academic/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' },
      { to: '/academic/scholarships', icon: Award, label: 'Học bổng' },
      { to: '/academic/warnings', icon: ShieldAlert, label: 'Cảnh báo học vụ' },
    ],
  },
  {
    label: 'Ký túc xá',
    section: 'assessment',
    items: [
      { to: '/dormitory/registrations', icon: Building2, label: 'Duyệt đăng ký KTX' },
    ],
  },
  {
    items: [
      { to: '/assessment', icon: Star, label: 'Đánh giá rèn luyện' },
    ],
  },
  {
    label: 'Sinh viên',
    section: 'lv5',
    items: [
      { to: '/students', icon: Users, label: 'Sinh viên' },
      { to: '/schedules', icon: CalendarDays, label: 'Thời khóa biểu' },
    ],
  },
  {
    label: 'Import',
    section: 'lv5',
    items: [
      { to: '/import/students', icon: Upload, label: 'Sinh viên' },
      { to: '/import/profiles', icon: UserCircle, label: 'Hồ sơ sinh viên' },
      { to: '/import/courses', icon: BookOpen, label: 'Học phần' },
      { to: '/import/enrollments', icon: ClipboardList, label: 'Đăng ký & Điểm' },
      { to: '/import/fees', icon: Wallet, label: 'Học phí' },
      { to: '/import/curriculum', icon: GraduationCap, label: 'Chương trình ĐT' },
      { to: '/import/dormitory', icon: Building2, label: 'Ký túc xá' },
    ],
  },
  {
    label: 'Tiện ích',
    section: 'lv5',
    items: [
      { to: '/academic', icon: BarChart2, label: 'Kết quả học tập' },
      { to: '/assessment', icon: Star, label: 'Đánh giá rèn luyện' },
      { to: '/notifications', icon: Bell, label: 'Thông báo' },
      { to: '/feedback', icon: MessageSquare, label: 'Phản hồi' },
      { to: '/service-requests', icon: ClipboardCheck, label: 'Yêu cầu dịch vụ' },
    ],
  },
  // ── STAFF level 5 restricted: chỉ thấy 3 nav items ──
  {
    label: 'Ký túc xá',
    section: 'lv5_restricted',
    items: [
      { to: '/dormitory/registrations', icon: Building2, label: 'Duyệt đăng ký KTX' },
      { to: '/import/dormitory', icon: Upload, label: 'Import KTX' },
      { to: '/import/enrollments', icon: ClipboardList, label: 'Import Đăng ký học phần' },
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

  // STAFF level 5: chỉ thấy xuất file KTX + học phần (không phải lv5 chung)
  const isLv5Restricted = role === 'STAFF' && staffLevel === 5;
  // ADMIN hoặc lv5 thông thường (staffLevel > 5 nếu có): thấy xuất file đầy đủ
  const showExport = canSee('lv5', role, staffLevel) || isLv5Restricted;

  const initials = (user.name || 'A')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function roleLabel() {
    if (role === 'ADMIN') return 'Quản trị viên';
    if (role === 'ADVISOR') return 'Cố vấn học tập';
    if (role === 'STAFF') {
      const map = { 1: 'Tập thể lớp', 2: 'Giảng viên', 3: 'Bộ môn', 4: 'Khoa', 5: 'Phòng giáo vụ' };
      return map[staffLevel] ?? 'Staff';
    }
    return 'Người dùng';
  }

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
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
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

        {/* ── Xuất file ── */}
        {showExport && (
          <div>
            {!collapsed && (
              <p className="text-[10px] uppercase tracking-widest text-ink-subtle px-3 mb-1 font-body">
                Xuất file
              </p>
            )}
            <button
              onClick={exportEnrollments}
              title={collapsed ? 'Xuất đăng ký học phần' : undefined}
              className={`nav-item w-full text-left ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Download size={18} className="nav-icon flex-shrink-0 text-ink-subtle" />
              {!collapsed && <span className="truncate">Đăng ký học phần</span>}
            </button>
            <button
              onClick={exportDormitory}
              title={collapsed ? 'Xuất đăng ký KTX' : undefined}
              className={`nav-item w-full text-left ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Download size={18} className="nav-icon flex-shrink-0 text-ink-subtle" />
              {!collapsed && <span className="truncate">Đăng ký KTX</span>}
            </button>
          </div>
        )}
      </nav>

      {/* ── Bottom: user row + collapse button ── */}
      <div className="border-t border-surface-border dark:border-slate-800">
        <div
          className={`
            h-14 flex items-center gap-3 px-3 overflow-hidden
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-semibold text-brand-700 text-xs">{initials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate leading-tight">
                {user.name || 'Admin'}
              </p>
              <p className="text-xs text-ink-subtle truncate">{roleLabel()}</p>
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