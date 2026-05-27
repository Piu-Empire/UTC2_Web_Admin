// src/components/import/FileDropzone.jsx
import { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, Download } from 'lucide-react';
import Button from '../common/Button';

const ACCEPT = '.xlsx,.xls,.csv';
const MAX_MB = 10;

function formatSize(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * @param {{
 *   file:          File|null,
 *   onFile:        (file: File|null) => void,
 *   sampleUrl?:    string,   // href for sample download; omit to hide link
 * }} props
 */
export default function FileDropzone({ file, onFile, sampleUrl }) {
  const inputRef  = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  }

  function handleChange(e) {
    const f = e.target.files[0];
    if (f) validateAndSet(f);
    e.target.value = '';
  }

  function validateAndSet(f) {
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      alert('Chỉ hỗ trợ .xlsx, .xls, .csv');
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      alert(`File không được vượt quá ${MAX_MB} MB`);
      return;
    }
    onFile(f);
  }

  async function handleDownloadSample(e) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(sampleUrl);
      if (!res.ok) throw new Error('Không tìm thấy file mẫu');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = sampleUrl.split('/').pop();
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Không tải được file mẫu: ' + err.message);
    }
  }

  // ── File selected state ──────────────────────────────
  if (file) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <FileSpreadsheet size={36} className="text-emerald-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{file.name}</p>
          <p className="text-xs text-ink-muted">{formatSize(file.size)}</p>
        </div>
        <button
          onClick={() => onFile(null)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
          title="Xoá file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // ── Empty dropzone ───────────────────────────────────
  return (
    <div className="space-y-3">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`dropzone flex flex-col items-center justify-center py-16 px-6 text-center cursor-pointer ${dragging ? 'active' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud size={48} className="text-ink-subtle mb-4" />
        <p className="text-base font-medium text-ink">Kéo thả file Excel / CSV vào đây</p>
        <p className="text-sm text-ink-muted mt-1 mb-4">hoặc</p>
        <Button
          variant="outlined"
          size="sm"
          onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Chọn file
        </Button>
        <p className="text-xs text-ink-subtle mt-4">
          Hỗ trợ: .xlsx · .xls · .csv — Tối đa {MAX_MB} MB
        </p>
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleChange}
      />

      {/* Sample download link */}
      {sampleUrl && (
        <button
          type="button"
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
        >
          <Download size={13} />
          Tải file mẫu .xlsx
        </button>
      )}
    </div>
  );
}