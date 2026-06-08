import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';

const LABELS = {
  '':                 'Dashboard',
  'students':         'Sinh viên',
  'import':           'Import',
  'students-detail':  'Chi tiết',
  'courses':          'Học phần',
  'enrollments':      'Đăng ký & Điểm',
  'schedules':        'Thời khóa biểu',
  'fees':             'Học phí',
  'curriculum':       'Chương trình ĐT',
  'notifications':    'Thông báo',
  'feedback':         'Phản hồi',
  'service-requests': 'Yêu cầu dịch vụ',
};

function buildBreadcrumb(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return 'Dashboard';
  const last = segments[segments.length - 1];
  const isId = /^[0-9a-f-]+$/i.test(last) && last.length > 4;
  const labeled = segments
    .filter((s, i) => !(isId && i === segments.length - 1))
    .map(s => LABELS[s] || s);
  if (isId) labeled.push('Chi tiết');
  return labeled.join(' / ');
}

export default function Header({ unreadCount = 0 }) {
  const location  = useLocation();
  const breadcrumb = buildBreadcrumb(location.pathname);

  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('utc2_dark', String(dark));
  }, [dark]);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
    catch { return {}; }
  })();
  const initials = (user.name || 'A')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <h1 className="font-display font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
        {breadcrumb}
      </h1>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setDark(d => !d)}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-hover-bg)'; e.currentTarget.style.color = 'var(--gold-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
          title={dark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg relative transition-colors"
          style={{ color: 'var(--text-subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-hover-bg)'; e.currentTarget.style.color = 'var(--gold-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
          title="Thông báo"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ background: 'var(--gold-primary)', boxShadow: '0 0 6px var(--gold-primary)' }}
            />
          )}
        </button>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer select-none ml-1"
          style={{ background: 'var(--avatar-bg)', border: '1px solid var(--avatar-border)' }}
          title={user.name || 'Admin'}
        >
          <span className="font-display font-semibold text-xs" style={{ color: 'var(--avatar-color)' }}>
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}