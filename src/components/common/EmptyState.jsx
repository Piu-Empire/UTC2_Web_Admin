// src/components/common/EmptyState.jsx (tạo mới)
import { Inbox } from 'lucide-react';

/**
 * @param {{
 *   icon?:     React.ReactNode,
 *   title?:    string,
 *   message?:  string,
 *   action?:   React.ReactNode,
 * }} props
 */
export default function EmptyState({
  icon    = <Inbox size={36} className="text-ink-subtle" />,
  title   = 'Không có dữ liệu',
  message = '',
  action  = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center">
        {icon}
      </div>
      <p className="font-display font-semibold text-ink text-[15px]">{title}</p>
      {message && (
        <p className="text-sm text-ink-muted max-w-xs leading-relaxed">{message}</p>
      )}
      {action}
    </div>
  );
}