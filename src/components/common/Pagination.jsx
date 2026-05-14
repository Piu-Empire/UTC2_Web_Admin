// src/components/common/Pagination.jsx (tạo mới)
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Tạo mảng trang hiển thị với ellipsis, tối đa 5 nút.
 * Ví dụ: [1, '…', 4, 5, 6, '…', 20]
 */
function buildPages(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i);

  const pages = new Set([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];

  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
    result.push(p);
  });

  return result;
}

/**
 * @param {{
 *   page:     number,   // 0-indexed
 *   total:    number,   // total items
 *   pageSize: number,
 *   onChange: (page: number) => void,
 * }} props
 */
export default function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to   = Math.min((page + 1) * pageSize, total);
  const pages = buildPages(page, totalPages);

  const btnBase = `
    w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium
    transition-colors select-none
  `;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      {/* Info text */}
      <p className="text-sm text-ink-muted">
        Hiển thị <span className="font-medium text-ink">{from}–{to}</span> trong{' '}
        <span className="font-medium text-ink">{total.toLocaleString('vi-VN')}</span> kết quả
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className={`${btnBase} border border-surface-border hover:bg-surface-hover
            text-ink-muted disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-ink-subtle">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`${btnBase}
                ${p === page
                  ? 'bg-brand-600 text-white border border-brand-600'
                  : 'border border-surface-border hover:bg-surface-hover text-ink-muted'
                }`}
            >
              {p + 1}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className={`${btnBase} border border-surface-border hover:bg-surface-hover
            text-ink-muted disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}