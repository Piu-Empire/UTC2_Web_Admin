// src/components/import/PreviewTable.jsx
import { SkeletonBar } from '../common/Skeleton';

const PREVIEW_ROWS = 10;

/**
 * @param {{
 *   headers:      string[],
 *   rawRows:      any[][],
 *   errorCells:   Set<string>,
 *   cellMessages: Record<string, string>,
 *   requiredCols: string[],
 *   missingCols:  string[],
 *   parsing:      boolean,
 * }} props
 */
export default function PreviewTable({
  headers, rawRows, errorCells, cellMessages,
  requiredCols, missingCols, parsing,
}) {
  const previewRows = rawRows.slice(0, PREVIEW_ROWS);

  // ── Loading skeleton ─────────────────────────────────
  if (parsing) {
    return (
      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface-muted border-b border-surface-border">
              {[1, 2, 3, 4].map(i => (
                <th key={i} className="px-4 py-2.5">
                  <SkeletonBar className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(r => (
              <tr key={r} className="border-b border-surface-border">
                {[1, 2, 3, 4].map(c => (
                  <td key={c} className="px-4 py-3">
                    <SkeletonBar className="h-3 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!headers.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface-muted border-b border-surface-border">
            {/* Row-number column */}
            <th className="px-3 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide w-12 text-center">
              #
            </th>

            {headers.map((h, ci) => {
              const isMissing  = missingCols.includes(h);
              const isRequired = requiredCols.some(
                rc => rc.toLowerCase() === h.toLowerCase()
              );
              return (
                <th
                  key={ci}
                  className={`
                    px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap
                    ${isMissing ? 'bg-rose-50 text-rose-700' : 'text-ink-muted'}
                  `}
                >
                  {h}
                  {isRequired && !isMissing && (
                    <span className="text-rose-500 ml-0.5">*</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {previewRows.map((row, ri) => (
            <tr
              key={ri}
              className={`
                border-b border-surface-border
                ${ri % 2 === 0 ? 'bg-white' : 'bg-surface-muted/40'}
                hover:bg-surface-hover transition-colors
              `}
            >
              {/* Row number */}
              <td className="px-3 py-2.5 text-xs text-ink-subtle text-center font-mono">
                {ri + 2}
              </td>

              {headers.map((_, ci) => {
                const key      = `${ri}-${ci}`;
                const hasError = errorCells.has(key);
                const val      = row[ci] ?? '';

                return (
                  <td
                    key={ci}
                    title={hasError ? cellMessages[key] : undefined}
                    className="px-4 py-2.5"
                  >
                    {hasError ? (
                      <span className="bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-300 rounded px-1.5 py-0.5 text-xs">
                        {String(val) || '(trống)'}
                      </span>
                    ) : (
                      <span className="text-ink">{String(val)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {rawRows.length > PREVIEW_ROWS && (
        <p className="text-xs text-ink-muted text-center py-2 border-t border-surface-border">
          Chỉ hiển thị {PREVIEW_ROWS} / {rawRows.length} dòng
        </p>
      )}
    </div>
  );
}