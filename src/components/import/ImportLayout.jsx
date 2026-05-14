// src/components/import/ImportLayout.jsx
import { Check } from 'lucide-react';

const STEPS = ['Chọn file', 'Xem trước & Kiểm tra', 'Tải lên', 'Kết quả'];

/**
 * Dumb layout wrapper: renders step indicator + children.
 * Parent owns `step` state (1-indexed).
 *
 * @param {{ step: number, title: string, children: React.ReactNode }} props
 */
export default function ImportLayout({ step, title, children }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page title */}
      <h1 className="font-display font-bold text-xl text-ink">{title}</h1>

      {/* Step indicator */}
      <div className="card p-5">
        <div className="flex items-center">
          {STEPS.map((label, i) => {
            const num     = i + 1;
            const isDone  = num < step;
            const isActive = num === step;

            return (
              <div key={num} className="flex items-center flex-1 last:flex-none">
                {/* Circle + label */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center
                      font-display font-bold text-sm select-none transition-all
                      ${isDone || isActive
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-muted text-ink-subtle border border-surface-border'}
                      ${isActive ? 'ring-4 ring-brand-100' : ''}
                    `}
                  >
                    {isDone ? <Check size={13} strokeWidth={3} /> : num}
                  </div>
                  <span
                    className={`
                      text-xs whitespace-nowrap
                      ${isActive ? 'font-semibold text-brand-600' : isDone ? 'text-ink-muted' : 'text-ink-subtle'}
                    `}
                  >
                    {label}
                  </span>
                </div>

                {/* Connector line (not after last) */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`
                      flex-1 h-px mx-3 mb-5 transition-colors
                      ${isDone ? 'bg-brand-600' : 'bg-surface-border'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="card p-6">
        {children}
      </div>
    </div>
  );
}