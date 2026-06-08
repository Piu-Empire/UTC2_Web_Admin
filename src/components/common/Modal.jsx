import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    el?.focus();
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`w-full ${maxWidth} animate-in`}
        style={{
          background: 'var(--modal-bg)',
          border: '1px solid var(--modal-border)',
          borderRadius: '20px',
          boxShadow: 'var(--modal-shadow)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '24px',
        }}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2
              id="modal-title"
              className="font-display font-semibold text-[16px]"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--text-subtle)', border: '1px solid var(--card-border)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--nav-hover-bg)'; e.currentTarget.style.color = 'var(--gold-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div>{children}</div>

        {footer && (
          <div
            className="flex items-center justify-end gap-2 mt-6 pt-5"
            style={{ borderTop: '1px solid var(--modal-footer-border)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}