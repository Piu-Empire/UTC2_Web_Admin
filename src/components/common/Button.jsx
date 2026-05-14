// src/components/common/Button.jsx (tạo mới)
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:  'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
  outlined: 'border border-surface-border hover:bg-surface-hover text-ink',
  ghost:    'hover:bg-surface-hover text-ink-muted',
  danger:   'bg-rose-600 hover:bg-rose-700 text-white',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2   text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
};

/**
 * @param {{
 *   variant?: 'primary'|'outlined'|'ghost'|'danger',
 *   size?:    'sm'|'md'|'lg',
 *   loading?: boolean,
 *   icon?:    React.ReactNode,
 *   disabled?: boolean,
 *   onClick?:  () => void,
 *   type?:     'button'|'submit'|'reset',
 *   className?: string,
 *   children:  React.ReactNode,
 * }} props
 */
export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  icon      = null,
  disabled  = false,
  type      = 'button',
  className = '',
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium font-body
        transition-colors select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant] ?? VARIANTS.primary}
        ${SIZES[size]       ?? SIZES.md}
        ${className}
      `}
      {...rest}
    >
      {/* Icon slot — replaced by spinner when loading */}
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : icon}
      {children}
    </button>
  );
}