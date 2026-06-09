import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: {
    background: 'var(--btn-primary-bg)',
    color: '#fff',
    border: '1px solid var(--btn-primary-border)',
    boxShadow: 'var(--btn-primary-shadow)',
  },
  outlined: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--card-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
    color: '#fff',
    border: '1px solid rgba(239,68,68,0.3)',
  },
};

const SIZES = {
  sm: { padding: '6px 12px',  fontSize: '12px', borderRadius: '8px',  gap: '6px' },
  md: { padding: '8px 16px',  fontSize: '14px', borderRadius: '10px', gap: '8px' },
  lg: { padding: '10px 20px', fontSize: '14px', borderRadius: '12px', gap: '8px' },
};

export default function Button({
  variant   = 'primary',
  size      = 'md',
  loading   = false,
  icon      = null,
  disabled  = false,
  type      = 'button',
  className = '',
  children,
  style     = {},
  ...rest
}) {
  const isDisabled   = disabled || loading;
  const variantStyle = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeStyle    = SIZES[size] ?? SIZES.md;

  return (
    <button
      type={type}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'filter 0.15s, transform 0.1s',
        ...variantStyle,
        ...sizeStyle,
        gap: sizeStyle.gap,
        ...style,
      }}
      onMouseEnter={e => { if (!isDisabled) e.currentTarget.style.filter = 'brightness(1.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
      onMouseDown={e =>  { if (!isDisabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e =>    { e.currentTarget.style.transform = 'scale(1)'; }}
      className={className}
      {...rest}
    >
      {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      {children}
    </button>
  );
}