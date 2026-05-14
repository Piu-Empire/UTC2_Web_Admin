// src/components/import/GenericImportPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ImportLayout      from './ImportLayout';
import FileDropzone      from './FileDropzone';
import ValidationSummary from './ValidationSummary';
import PreviewTable      from './PreviewTable';
import UploadProgress    from './UploadProgress';
import ResultPanel       from './ResultPanel';
import Button            from '../common/Button';
import { parseExcelFile } from '../../utils/parseExcel';
import { uploadImport }   from '../../api/importApi';

const EMPTY_PARSE = {
  headers: [], rows: [], rawRows: [],
  errorCells: new Set(), cellMessages: {},
  missingCols: [], validCount: 0, invalidCount: 0,
};

/**
 * @param {{
 *   title:        string,
 *   description:  string,
 *   entity:       string,          // API entity slug
 *   requiredCols: string[],
 *   sampleUrl?:   string,
 *   viewDataPath: string,          // navigate target after import
 * }} props
 */
export default function GenericImportPage({
  title,
  description,
  entity,
  requiredCols,
  sampleUrl,
  viewDataPath,
}) {
  const navigate = useNavigate();

  const [step,       setStep]       = useState(1);
  const [file,       setFile]       = useState(null);
  const [parsing,    setParsing]    = useState(false);
  const [parsed,     setParsed]     = useState(EMPTY_PARSE);
  const [overwrite,  setOverwrite]  = useState(false);
  const [skipErrors, setSkipErrors] = useState(false);
  const [result,     setResult]     = useState(null);

  useEffect(() => {
    if (!file) { setParsed(EMPTY_PARSE); return; }
    setParsing(true);
    parseExcelFile(file, requiredCols)
      .then(p => setParsed(p))
      .finally(() => setParsing(false));
  }, [file]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFileSelect(f) {
    setFile(f);
    if (f) setStep(2);
  }

  function handleReset() {
    setFile(null);
    setParsed(EMPTY_PARSE);
    setResult(null);
    setStep(1);
  }

  const canProceed =
    parsed.validCount > 0 &&
    parsed.missingCols.length === 0 &&
    (parsed.invalidCount === 0 || skipErrors);

  return (
    <ImportLayout step={step} title={title}>

      {/* Step 1 — Chọn file */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">{description}</p>
          <FileDropzone file={file} onFile={handleFileSelect} sampleUrl={sampleUrl} />
          {file && (
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} icon={<ChevronRight size={15} />}>
                Xem trước
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Preview & validate */}
      {step === 2 && (
        <div className="space-y-4">
          <ValidationSummary
            validCount={parsed.validCount}
            invalidCount={parsed.invalidCount}
            missingCols={parsed.missingCols}
            cellMessages={parsed.cellMessages}
            headers={parsed.headers}
            rows={parsed.rows}
          />

          <PreviewTable
            headers={parsed.headers}
            rawRows={parsed.rawRows}
            errorCells={parsed.errorCells}
            cellMessages={parsed.cellMessages}
            requiredCols={requiredCols}
            missingCols={parsed.missingCols}
            parsing={parsing}
          />

          {/* Options */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={e => setOverwrite(e.target.checked)}
                className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
              />
              Ghi đè nếu bản ghi đã tồn tại
            </label>
            {parsed.invalidCount > 0 && (
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipErrors}
                  onChange={e => setSkipErrors(e.target.checked)}
                  className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                Bỏ qua lỗi, tiếp tục với{' '}
                <span className="font-medium text-emerald-600">{parsed.validCount}</span> dòng hợp lệ
              </label>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outlined" icon={<ChevronLeft size={15} />} onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button disabled={!canProceed} icon={<ChevronRight size={15} />} onClick={() => setStep(3)}>
              Tải lên {parsed.validCount} dòng
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Upload */}
      {step === 3 && (
        <UploadProgress
          file={file}
          totalRows={parsed.validCount}
          uploadFn={onProgress => uploadImport(entity, file, overwrite, onProgress)}
          onComplete={res => { setResult(res); setStep(4); }}
        />
      )}

      {/* Step 4 — Result */}
      {step === 4 && result && (
        <ResultPanel
          result={result}
          onReset={handleReset}
          onViewData={() => navigate(viewDataPath)}
        />
      )}

    </ImportLayout>
  );
}