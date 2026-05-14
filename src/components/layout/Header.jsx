import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

// ─── Path → breadcrumb label map ─────────────────────────
const LABELS = {
  '':                  'Dashboard',
  'students':          'Sinh viên',
  'import':            'Import',
  'students-detail':   'Chi tiết',
  'courses':           'Học phần',
  'enrollments':       'Đăng ký & Điểm',
  'schedules':         'Thời khóa biểu',
  'fees':              'Học phí',
  'curriculum':        'Chương trình ĐT',
  'notifications':     'Thông báo',
  'feedback':          'Phản hồi',
  'service-requests':  'Yêu cầu dịch vụ',
};

function buildBreadcrumb(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';

  // Check if last segment is an ID (numeric or UUID-like)
  const last = segments[segments.length - 1];
  const isId = /^[0-9a-f-]+$/i.test(last) && last.length > 4;

  const labeledSegments = segments
    .filter((s, i) => !(isId && i === segments.length - 1))
    .map(s => LABELS[s] || s);

  if (isId) labeledSegments.push('Chi tiết');
  return labeledSegments.join(' / ');
}

// ─── Component ───────────────────────────────────────────
export default function Header({ unreadCount = 0 }) {
  const location = useLocation();
  const breadcrumb = buildBreadcrumb(location.pathname);

  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  // Sync dark class + localStorage
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('utc2_dark', String(dark));
  }, [dark]);

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
    <header className="
      h-14 flex items-center justify-between px-6
      bg-white border-b border-surface-border flex-shrink-0
      dark:bg-slate-900 dark:border-slate-700
    ">
      {/* Left — Breadcrumb */}
      <h1 className="font-display font-semibold text-ink text-[15px] dark:text-slate-100">
        {breadcrumb}
      </h1>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(d => !d)}
          className="
            w-9 h-9 flex items-center justify-center rounded-lg
            hover:bg-surface-hover dark:hover:bg-slate-800
            text-ink-muted dark:text-slate-400
            transition-colors
          "
          title={dark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification bell */}
        <button
          className="
            w-9 h-9 flex items-center justify-center rounded-lg relative
            hover:bg-surface-hover dark:hover:bg-slate-800
            text-ink-muted dark:text-slate-400
            transition-colors
          "
          title="Thông báo"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="
              absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500
            " />
          )}
        </button>

        {/* User avatar */}
        <div
          className="
            w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center
            cursor-pointer select-none
          "
          title={user.name || 'Admin'}
        >
          <span className="font-display font-semibold text-brand-700 text-xs">
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
