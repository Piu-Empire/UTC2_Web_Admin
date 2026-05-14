// src/components/common/Badge.jsx (tạo mới)

// variant → CSS class từ index.css
const MAP = {
  success: 'badge-success',
  warning: 'badge-warning',
  error:   'badge-error',
  danger:  'badge-error',
  info:    'badge-info',
  neutral: 'badge-neutral',
};

/**
 * @param {{ variant?: keyof MAP, children: React.ReactNode, className?: string }} props
 */
export default function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span className={`badge ${MAP[variant] ?? 'badge-neutral'} ${className}`}>
      {children}
    </span>
  );
}