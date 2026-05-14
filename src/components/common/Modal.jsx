// src/components/common/Modal.jsx (tạo mới)
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * @param {{
 *   open:      boolean,
 *   onClose:   () => void,
 *   title?:    string,
 *   children:  React.ReactNode,
 *   footer?:   React.ReactNode,
 *   maxWidth?: string,  // Tailwind max-w-* class, default 'max-w-lg'
 * }} props
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  const panelRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus first focusable element on open
  useEffect(() => {
    if (!open) return;
    const el = panelRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    el?.focus();
  }, [open]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`card dark:bg-slate-900 dark:border-slate-700 w-full ${maxWidth} p-6 animate-in`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2
              id="modal-title"
              className="font-display font-semibold text-ink dark:text-slate-100 text-[16px]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 mt-6 pt-5 border-t border-surface-border dark:border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}