import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { exportEnrollments, exportDormitory } from '../../api/exportApi';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Upload,
  BookOpen,
  ClipboardList,
  CalendarDays,
  Wallet,
  GraduationCap,
  Bell,
  MessageSquare,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart2,
  Award,
  ShieldAlert,
  Star,
  Pencil,
  CheckSquare,
  Building2,
  UserCircle,
  Download,
} from 'lucide-react';

function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
  catch { return {}; }
}

function buildNavGroups(role, staffLevel) {
  const isAdmin   = role === 'ADMIN';
  const isAdvisor = role === 'ADVISOR';
  const isStaff   = role === 'STAFF';
  const lv        = staffLevel ?? 0;

  const groups = [];

  // ── Main ──────────────────────────────────────────────────────────────
  groups.push({
    label: 'Main',
    items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true }],
  });

  // ── Quản lý ───────────────────────────────────────────────────────────
  const qlItems = [];
  if (isAdmin || (isStaff && lv >= 5))
    qlItems.push({ to: '/students', icon: Users, label: 'Sinh viên' });

  if (isAdmin || (isStaff && lv >= 5))
  qlItems.push({ to: '/schedules', icon: CalendarDays, label: 'Thời khóa biểu' });

  if (isAdmin || (isStaff && lv >= 2))
    qlItems.push({ to: '/academic/grades', icon: BarChart2, label: 'Kết quả học tập' });

  if (isAdmin || (isStaff && lv >= 5))
    qlItems.push({ to: '/academic/teacher-courses', icon: Users, label: 'Phân công giảng viên' });

  if (isAdmin || (isStaff && lv >= 5))
    qlItems.push({ to: '/academic/approval', icon: CheckSquare, label: 'Duyệt dữ liệu' });

  if (isAdmin || isAdvisor || (isStaff && lv >= 3))
    qlItems.push({ to: '/academic/leaderboard', icon: Trophy, label: 'Bảng xếp hạng' });

  if (isAdmin || (isStaff && lv >= 3)) {
    qlItems.push({ to: '/academic/scholarships', icon: Award,       label: 'Học bổng'         });
    qlItems.push({ to: '/academic/warnings',     icon: ShieldAlert, label: 'Cảnh báo học vụ' });
  }
  if (isAdvisor) {
    qlItems.push({ to: '/academic/advisor/scholarships', icon: Award,       label: 'Học bổng'         });
    qlItems.push({ to: '/academic/advisor/warnings',     icon: ShieldAlert, label: 'Cảnh báo học vụ' });
  }

  // Đánh giá rèn luyện: admin + advisor + lv1, lv3, lv4, lv5 (không lv2, không null)
  if (isAdmin || isAdvisor || (isStaff && (lv === 1 || lv >= 3)))
    qlItems.push({ to: '/assessment', icon: Star, label: 'Đánh giá rèn luyện' });

  if (qlItems.length > 0)
    groups.push({ label: 'Quản lý', items: qlItems });

  // ── Import ─────────────────────────────────────────────────────────────
  if (isAdmin || (isStaff && lv >= 5) || (isStaff && lv === 2)) {
    const importItems = [];
    if (isAdmin || (isStaff && lv >= 5)) {
      importItems.push({ to: '/import/students',    icon: Upload,        label: 'Sinh viên'        });
      importItems.push({ to: '/import/courses',     icon: BookOpen,      label: 'Học phần'         });
      importItems.push({ to: '/import/enrollments', icon: ClipboardList, label: 'Đăng ký'          });
    }
    if (isAdmin || (isStaff && lv >= 5))
      importItems.push({
        to: '/import/profiles',
        icon: UserCircle,
        label: 'Hồ sơ sinh viên',
      });

    if (isAdmin || (isStaff && lv === 2))
      importItems.push({ to: '/import/grades',          icon: Pencil, label: 'Điểm'                  });
    if (isAdmin || (isStaff && lv >= 5))
      importItems.push({ to: '/import/teacher-courses', icon: Users,  label: 'Phân công giảng viên' });
    if (isAdmin || (isStaff && lv >= 5)) {
      importItems.push({ to: '/import/schedules',  icon: CalendarDays,  label: 'Thời khóa biểu'  });
      importItems.push({ to: '/import/fees',       icon: Wallet,        label: 'Học phí'          });
      importItems.push({ to: '/import/curriculum', icon: GraduationCap, label: 'Chương trình ĐT' });
    }
    
    if (isAdmin || (isStaff && lv >= 5))
      importItems.push({
        to: '/import/dormitory',
        icon: Building2,
        label: 'Ký túc xá',
      });
    if (importItems.length > 0)
      groups.push({ label: 'Import', items: importItems });

  }
  // ── Ký túc xá ──────────────────────────────────────────────────────────
  if (isAdmin || isAdvisor || (isStaff && lv >= 1)) {
    groups.push({
      label: 'Ký túc xá',
      items: [
        {
          to: '/dormitory/registrations',
          icon: Building2,
          label: 'Duyệt đăng ký KTX',
        },
      ],
    });
  }
  // ── Tiện ích ───────────────────────────────────────────────────────────
  if (isAdmin || (isStaff && lv >= 5)) {
    groups.push({
      label: 'Tiện ích',
      items: [
        { to: '/notifications',    icon: Bell,           label: 'Thông báo'        },
        { to: '/feedback',         icon: MessageSquare,  label: 'Phản hồi'         },
        { to: '/service-requests', icon: ClipboardCheck, label: 'Yêu cầu dịch vụ' },
      ],
    });
  }

  return groups;
}

function handleLogout() {
  localStorage.removeItem('utc2_token');
  localStorage.removeItem('utc2_user');
  window.location.href = '/login';
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = getUser();
  const { role, staffLevel } = user;

  const visibleGroups = buildNavGroups(role, staffLevel);

  // STAFF level 5: chỉ thấy xuất file KTX + học phần (không phải lv5 chung)
  const isLv5Restricted = role === 'STAFF' && staffLevel === 5;
  // ADMIN hoặc lv5 thông thường (staffLevel > 5 nếu có): thấy xuất file đầy đủ
  const showExport = role === 'ADMIN' || (role === 'STAFF' && staffLevel >= 5) || isLv5Restricted;

  const initials = (user.name || 'A')
    .split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();

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
      className={`flex flex-col h-screen flex-shrink-0 transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-60'}`}
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className={`h-16 flex items-center px-3 gap-3 overflow-hidden flex-shrink-0`}
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--logo-bg)', boxShadow: 'var(--logo-shadow)' }}
        >
          <span className="font-display font-bold text-white text-[18px] leading-none">U</span>
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-[15px] whitespace-nowrap text-gold">
            UTC2 Admin
          </span>
        )}
      </div>

      {/* ── Nav groups ── */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {visibleGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p
                className="text-[10px] uppercase tracking-widest px-3 mb-1 font-body"
                style={{ color: 'var(--section-label)' }}
              >
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
                    className="nav-icon flex-shrink-0"
                    style={{ color: isActive ? 'var(--nav-active-color)' : 'var(--nav-color)' }}
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

      {/* User + collapse */}
      <div style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <div className={`h-14 flex items-center gap-3 px-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--avatar-bg)', border: '1px solid var(--avatar-border)' }}
          >
            <span className="font-display font-semibold text-xs" style={{ color: 'var(--avatar-color)' }}>
              {initials}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user.name || 'Admin'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-subtle)' }}>{roleLabel()}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-subtle)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
            >
              <LogOut size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full h-9 flex items-center justify-center transition-colors"
          style={{ borderTop: '1px solid var(--sidebar-border)', color: 'var(--text-subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-hover-bg)'; e.currentTarget.style.color = 'var(--gold-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}