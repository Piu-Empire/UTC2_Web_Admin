// src/components/import/UploadProgress.jsx
import { useEffect, useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';

/**
 * Starts upload immediately on mount.
 *
 * @param {{
 *   file:        File,
 *   totalRows:   number,
 *   onComplete:  (result: object) => void,
 *   uploadFn:    (onProgress: (pct: number) => void) => Promise<object>,
 * }} props
 */
export default function UploadProgress({ file, totalRows, onComplete, uploadFn }) {
  const [pct,   setPct]   = useState(0);
  const [done,  setDone]  = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const response = await uploadFn(p => {
          if (!cancelled) setPct(p);
        });
        if (!cancelled) {
          setPct(100);
          setDone(true);
          // Server returns ApiResponse<ImportResultDto>: { success, data: { success, failed, errors } }
          const payload = response?.data?.data ?? response?.data ?? response;
          // Normalize to { success, failed, errors }
          const normalized = {
            success: payload?.success ?? 0,
            failed: payload?.failed ?? 0,
            errors: payload?.errors ?? [],
          };
          // Brief pause so user sees the 100% state
          setTimeout(() => { if (!cancelled) onComplete(normalized); }, 900);
        }
      } catch (err) {
        if (!cancelled) {
          const serverMsg = err.response?.data?.message ?? err.response?.data?.error ?? null;
          setError(serverMsg ?? 'Tải lên thất bại. Vui lòng thử lại.');
        }
      }
    }
    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processed = Math.round((pct / 100) * totalRows);

  return (
    <div className="flex flex-col items-center text-center py-16">
      {/* Icon */}
      {done ? (
        <CheckCircle2 size={48} className="text-emerald-500 mb-6" />
      ) : (
        <Upload size={48} className="text-brand-400 animate-bounce mb-6" />
      )}

      {/* Title */}
      <p className="font-display font-semibold text-lg text-ink">
        {error ? 'Tải lên thất bại' : done ? 'Hoàn thành!' : 'Đang tải lên dữ liệu...'}
      </p>
      <p className="text-sm text-ink-muted mt-1">
        {error
          ? error
          : done
          ? 'Đang chuyển sang kết quả...'
          : 'Vui lòng không đóng tab này'}
      </p>

      {!error && (
        <>
          {/* Progress bar */}
          <div className="w-full max-w-sm mt-8 mb-3">
            <div className="h-2 bg-surface-border rounded-full overflow-hidden">
              <div
                className="h-2 bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Row counter */}
          <p className="text-sm text-ink-muted">
            {processed.toLocaleString('vi-VN')} / {totalRows.toLocaleString('vi-VN')} dòng đã xử lý
            &nbsp;·&nbsp;<span className="font-medium text-ink">{pct}%</span>
          </p>
        </>
      )}
    </div>
  );
}