// src/components/import/ResultPanel.jsx
import { CheckCircle2, AlertTriangle, Download, RotateCcw, ArrowRight } from 'lucide-react';
import Button from '../common/Button';
import { exportErrorCSV, downloadBlob } from '../../utils/parseExcel';

/**
 * @param {{
 *   result:       { success: number, failed: number, errors: {row,field,message}[] },
 *   onReset:      () => void,        // "Import thêm file"
 *   onViewData?:  () => void,        // "Xem dữ liệu"
 * }} props
 */
export default function ResultPanel({ result, onReset, onViewData }) {
  const { success = 0, failed = 0, errors = [] } = result;
  const allSuccess = failed === 0;

  function handleDownload() {
    const blob = exportErrorCSV(errors);
    downloadBlob(blob, 'import-errors.csv');
  }

  return (
    <div className="flex flex-col items-center text-center py-12">
      {/* Icon */}
      {allSuccess ? (
        <CheckCircle2 size={56} className="text-emerald-500 mb-5" />
      ) : (
        <AlertTriangle size={56} className="text-amber-500 mb-5" />
      )}

      {/* Title */}
      <p className="font-display font-bold text-2xl text-ink">
        {allSuccess ? 'Import hoàn thành!' : 'Import hoàn thành một phần'}
      </p>

      {/* Subtitle */}
      {allSuccess ? (
        <p className="text-sm text-ink-muted mt-2">
          <span className="font-medium text-emerald-600">{success.toLocaleString('vi-VN')}</span>{' '}
          dòng đã được lưu vào hệ thống
        </p>
      ) : (
        <p className="text-sm text-ink-muted mt-2 flex items-center gap-4 justify-center">
          <span>
            <span className="font-medium text-emerald-600">{success.toLocaleString('vi-VN')}</span> thành công
          </span>
          <span>
            <span className="font-medium text-rose-600">{failed.toLocaleString('vi-VN')}</span> thất bại
          </span>
        </p>
      )}

      {/* Error table */}
      {errors.length > 0 && (
        <div className="w-full max-w-xl mt-6 text-left">
          <div className="overflow-auto max-h-48 rounded-xl border border-rose-200">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0">
                <tr className="bg-rose-50 border-b border-rose-200">
                  <th className="px-3 py-2 font-semibold text-rose-700 w-16">Dòng</th>
                  <th className="px-3 py-2 font-semibold text-rose-700">Cột</th>
                  <th className="px-3 py-2 font-semibold text-rose-700">Lỗi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 bg-white">
                {errors.map((e, i) => (
                  <tr key={i} className="hover:bg-rose-50 transition-colors">
                    <td className="px-3 py-2 font-mono text-ink-subtle">{e.row}</td>
                    <td className="px-3 py-2 text-ink">{e.field}</td>
                    <td className="px-3 py-2 text-rose-600">{e.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 mt-8 flex-wrap justify-center">
        {!allSuccess && errors.length > 0 && (
          <Button
            variant="outlined"
            icon={<Download size={15} />}
            onClick={handleDownload}
          >
            Tải báo cáo lỗi .csv
          </Button>
        )}
        <Button
          variant="outlined"
          icon={<RotateCcw size={15} />}
          onClick={onReset}
        >
          Import thêm file
        </Button>
        {onViewData && (
          <Button
            variant="primary"
            icon={<ArrowRight size={15} />}
            onClick={onViewData}
          >
            Xem dữ liệu
          </Button>
        )}
      </div>
    </div>
  );
}