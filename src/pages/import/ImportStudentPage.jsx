// src/pages/import/ImportStudentPage.jsx (ghi đè placeholder)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ImportLayout      from '../../components/import/ImportLayout';
import FileDropzone      from '../../components/import/FileDropzone';
import ValidationSummary from '../../components/import/ValidationSummary';
import PreviewTable      from '../../components/import/PreviewTable';
import UploadProgress    from '../../components/import/UploadProgress';
import ResultPanel       from '../../components/import/ResultPanel';
import Button            from '../../components/common/Button';
import { parseExcelFile } from '../../utils/parseExcel';
import { uploadImport }   from '../../api/importApi';

// Required columns for student import
const REQUIRED_COLS = [
  'email', 'full_name', 'student_code',
  'faculty', 'major', 'academic_year', 'status',
];

// Initial parse state
const EMPTY_PARSE = {
  headers: [], rows: [], rawRows: [],
  errorCells: new Set(), cellMessages: {},
  missingCols: [], validCount: 0, invalidCount: 0,
};

export default function ImportStudentPage() {
  const navigate = useNavigate();

  const [step,      setStep]      = useState(1);
  const [file,      setFile]      = useState(null);
  const [parsing,   setParsing]   = useState(false);
  const [parsed,    setParsed]    = useState(EMPTY_PARSE);
  const [overwrite, setOverwrite] = useState(false);
  const [skipErrors,setSkipErrors]= useState(false);
  const [result,    setResult]    = useState(null);

  // Parse file whenever it changes
  useEffect(() => {
    if (!file) { setParsed(EMPTY_PARSE); return; }
    setParsing(true);
    parseExcelFile(file, REQUIRED_COLS)
      .then(p => setParsed(p))
      .finally(() => setParsing(false));
  }, [file]);

  function handleFileSelect(f) {
    setFile(f);
    if (f) setStep(2); // jump to preview when file chosen
  }

  function handleReset() {
    setFile(null);
    setParsed(EMPTY_PARSE);
    setResult(null);
    setStep(1);
  }

  const canProceedToUpload =
    parsed.validCount > 0 &&
    (parsed.invalidCount === 0 || skipErrors) &&
    parsed.missingCols.length === 0;

  return (
    <ImportLayout step={step} title="Import Sinh viên">

      {/* ── Step 1: Chọn file ── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">
            Upload file Excel / CSV chứa dữ liệu sinh viên. Hệ thống sẽ tạo tài khoản
            và hồ sơ sinh viên tương ứng.
          </p>
          <FileDropzone
            file={file}
            onFile={handleFileSelect}
            sampleUrl="/samples/students-sample.xlsx"
          />
          {file && (
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} icon={<ChevronRight size={15}/>}>
                Xem trước
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Preview & validate ── */}
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
            requiredCols={REQUIRED_COLS}
            missingCols={parsed.missingCols}
            parsing={parsing}
          />

          {/* Options */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overwrite}
                onChange={e => setOverwrite(e.target.checked)}
                className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
              />
              Ghi đè nếu sinh viên đã tồn tại (theo <code className="font-mono text-xs">student_code</code>)
            </label>
            {parsed.invalidCount > 0 && (
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipErrors}
                  onChange={e => setSkipErrors(e.target.checked)}
                  className="rounded border-surface-border text-brand-600 focus:ring-brand-500"
                />
                Bỏ qua lỗi và tiếp tục với{' '}
                <span className="font-medium text-emerald-600">{parsed.validCount}</span> dòng hợp lệ
              </label>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            <Button variant="outlined" icon={<ChevronLeft size={15}/>} onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button
              disabled={!canProceedToUpload}
              icon={<ChevronRight size={15}/>}
              onClick={() => setStep(3)}
            >
              Tải lên {parsed.validCount} dòng
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Upload ── */}
      {step === 3 && (
        <UploadProgress
          file={file}
          totalRows={parsed.validCount}
          uploadFn={onProgress => uploadImport('students', file, overwrite, onProgress)}
          onComplete={res => { setResult(res); setStep(4); }}
        />
      )}

      {/* ── Step 4: Result ── */}
      {step === 4 && result && (
        <ResultPanel
          result={result}
          onReset={handleReset}
          onViewData={() => navigate('/students')}
        />
      )}

    </ImportLayout>
  );
}