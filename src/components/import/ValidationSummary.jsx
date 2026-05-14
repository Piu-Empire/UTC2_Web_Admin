// src/components/import/ValidationSummary.jsx
import { CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
import { exportErrorCSV, downloadBlob } from '../../utils/parseExcel';

/**
 * @param {{
 *   validCount:   number,
 *   invalidCount: number,
 *   missingCols:  string[],
 *   cellMessages: Record<string, string>,
 *   headers:      string[],
 *   rows:         object[],
 * }} props
 */
export default function ValidationSummary({
  validCount, invalidCount, missingCols, cellMessages, headers, rows,
}) {
  const hasErrors = invalidCount > 0 || missingCols.length > 0;

  function handleDownloadErrors() {
    const errors = Object.entries(cellMessages).map(([key, message]) => {
      const [ri, ci] = key.split('-').map(Number);
      return { row: ri + 2, field: headers[ci] ?? ci, message };
    });
    const blob = exportErrorCSV(errors);
    downloadBlob(blob, 'import-errors.csv');
  }

  return (
    <div
      className={`
        rounded-xl p-4 flex items-center gap-6 mb-4 border
        ${hasErrors
          ? 'bg-rose-50 border-rose-200'
          : 'bg-emerald-50 border-emerald-200'}
      `}
    >
      {/* Valid count */}
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
        <div>
          <span className="font-display font-bold text-lg text-emerald-700">
            {validCount}
          </span>
          <span className="text-xs text-ink-muted ml-1.5">dòng hợp lệ</span>
        </div>
      </div>

      {/* Invalid count */}
      <div className="flex items-center gap-2">
        <XCircle size={18} className="text-rose-500 flex-shrink-0" />
        <div>
          <span className="font-display font-bold text-lg text-rose-600">
            {invalidCount}
          </span>
          <span className="text-xs text-ink-muted ml-1.5">dòng lỗi</span>
        </div>
      </div>

      {/* Missing cols */}
      {missingCols.length > 0 && (
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-display font-bold text-lg text-amber-600">
              {missingCols.length}
            </span>
            <span className="text-xs text-ink-muted ml-1.5">
              cột thiếu: {missingCols.join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Download error report */}
      {hasErrors && Object.keys(cellMessages).length > 0 && (
        <button
          onClick={handleDownloadErrors}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:underline font-medium"
        >
          <Download size={13} />
          Tải báo cáo lỗi .csv
        </button>
      )}
    </div>
  );
}