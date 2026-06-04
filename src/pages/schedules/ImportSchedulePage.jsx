// src/pages/schedules/ImportSchedulePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import ImportLayout from '../../components/import/ImportLayout';
import FileDropzone from '../../components/import/FileDropzone';
import ValidationSummary from '../../components/import/ValidationSummary';
import PreviewTable from '../../components/import/PreviewTable';
import UploadProgress from '../../components/import/UploadProgress';
import ResultPanel from '../../components/import/ResultPanel';
import Button from '../../components/common/Button';
import { parseExcelFile } from '../../utils/parseExcel';
import { scheduleApi } from '../../api/scheduleApi';
import { semesterApi } from '../../api/semesterApi';
const EMPTY_PARSE = {
  headers: [], rows: [], rawRows: [],
  errorCells: new Set(), cellMessages: {},
  missingCols: [], validCount: 0, invalidCount: 0,
};

const SCHEDULE_TYPES = {
  '1': {
    label: 'Lịch học',
    sample: '/samples/schedule-study-sample.xlsx',
    cols: ['course_code', 'semester_id', 'day_of_week', 'start_period', 'end_period', 'start_time', 'end_time', 'room', 'building', 'lecturer_id', 'week_start', 'week_end', 'notes']
  },
  '2': {
    label: 'Lịch thi',
    sample: '/samples/schedule-exam-sample.xlsx',
    cols: ['course_code', 'semester_id', 'event_date', 'start_time', 'end_time', 'room', 'building', 'notes']
  },
  '3': {
    label: 'Lịch thi lại',
    sample: '/samples/schedule-reexam-sample.xlsx',
    cols: ['course_code', 'semester_id', 'event_date', 'start_time', 'end_time', 'room', 'building', 'notes']
  }
};

export default function ImportSchedulePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [scheduleType, setScheduleType] = useState('1'); // Mặc định Lịch học
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(EMPTY_PARSE);
  const [overwrite, setOverwrite] = useState(false);
  const [skipErrors, setSkipErrors] = useState(false);
  const [result, setResult] = useState(null);

  const currentConfig = SCHEDULE_TYPES[scheduleType];

  // Khi đổi type, reset file
  useEffect(() => {
    setFile(null);
    setParsed(EMPTY_PARSE);
  }, [scheduleType]);

  useEffect(() => {
    if (!file) { setParsed(EMPTY_PARSE); return; }
    setParsing(true);
    parseExcelFile(file, currentConfig.cols)
      .then(p => setParsed(p))
      .finally(() => setParsing(false));
  }, [file, currentConfig.cols]);

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
    <div className="space-y-4">
      {/* Thêm nút quay lại ở trên cùng */}
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />} onClick={() => navigate(-1)}>
        Quay lại
      </Button>

      {/* DÒNG NÀY BỊ THIẾU TRONG CODE CỦA BẠN: */}
      <ImportLayout step={step} title="Import Thời Khóa Biểu">

        {/* Step 1 — Chọn file */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              Chọn loại lịch và tải lên file Excel/CSV đúng định dạng.
            </p>

            <div className="max-w-xs">
              <label className="block text-sm font-medium text-ink mb-1.5">Loại thời khóa biểu</label>
              <select
                value={scheduleType}
                onChange={e => setScheduleType(e.target.value)}
                className="w-full border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="1">Lịch học</option>
                <option value="2">Lịch thi</option>
                <option value="3">Lịch thi lại</option>
              </select>
            </div>

            <FileDropzone
              file={file}
              onFile={handleFileSelect}
              sampleUrl={currentConfig.sample}
            />

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
              requiredCols={currentConfig.cols}
              missingCols={parsed.missingCols}
              parsing={parsing}
            />

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
            uploadFn={onProgress => scheduleApi.importExcel(file, scheduleType, overwrite, onProgress)}
            onComplete={res => { setResult(res); setStep(4); }}
          />
        )}

        {/* Step 4 — Result */}
        {step === 4 && result && (
          <ResultPanel
            result={result}
            onReset={handleReset}
            onViewData={() => navigate('/schedules')}
          />
        )}

      </ImportLayout>
    </div>
  );
}
