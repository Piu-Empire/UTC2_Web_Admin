// src/utils/parseExcel.js
import * as XLSX from 'xlsx';

/**
 * Parse an Excel/CSV file and validate required columns.
 *
 * @param {File} file
 * @param {string[]} requiredCols  - column keys that must be present & non-empty
 * @returns {Promise<{
 *   headers:      string[],
 *   rows:         object[],
 *   rawRows:      any[][],          // raw 2-D array for PreviewTable
 *   errorCells:   Set<string>,      // "rowIndex-colIndex" keys
 *   cellMessages: Record<string, string>,  // key → validation message
 *   missingCols:  string[],
 *   validCount:   number,
 *   invalidCount: number,
 * }>}
 */
export async function parseExcelFile(file, requiredCols = []) {
  const buffer = await file.arrayBuffer();
  const wb     = XLSX.read(buffer, { type: 'array', cellDates: true });
  const ws     = wb.Sheets[wb.SheetNames[0]];

  // sheet_to_json with header:1 gives raw 2-D array
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (raw.length < 2) {
    return {
      headers: [], rows: [], rawRows: [],
      errorCells: new Set(), cellMessages: {},
      missingCols: requiredCols, validCount: 0, invalidCount: 0,
    };
  }

  const headers    = raw[0].map(h => String(h).trim());
  const dataRows   = raw.slice(1).filter(r => r.some(c => c !== ''));

  // Detect missing required columns
  const missingCols = requiredCols.filter(
    rc => !headers.some(h => h.toLowerCase() === rc.toLowerCase())
  );

  // Build column index map (case-insensitive)
  const colIndex = {};
  headers.forEach((h, i) => { colIndex[h.toLowerCase()] = i; });

  const errorCells   = new Set();
  const cellMessages = {};
  const rowObjects   = [];
  let   invalidCount = 0;

  dataRows.forEach((row, ri) => {
    const obj = {};
    let rowHasError = false;

    headers.forEach((h, ci) => {
      const val = row[ci] ?? '';
      obj[h] = val;

      // Check required columns
      const isRequired = requiredCols.some(rc => rc.toLowerCase() === h.toLowerCase());
      if (isRequired && String(val).trim() === '') {
        const key = `${ri}-${ci}`;
        errorCells.add(key);
        cellMessages[key] = `Cột "${h}" là bắt buộc`;
        rowHasError = true;
      }

      // Basic format checks
      if (h.toLowerCase().includes('email') && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        const key = `${ri}-${ci}`;
        errorCells.add(key);
        cellMessages[key] = 'Sai định dạng email';
        rowHasError = true;
      }
      if ((h.toLowerCase().includes('score') || h.toLowerCase().includes('diem'))
          && val !== '' && (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 10)) {
        const key = `${ri}-${ci}`;
        errorCells.add(key);
        cellMessages[key] = 'Điểm phải trong khoảng 0–10';
        rowHasError = true;
      }
    });

    if (rowHasError) invalidCount++;
    rowObjects.push(obj);
  });

  return {
    headers,
    rows:         rowObjects,
    rawRows:      dataRows,
    errorCells,
    cellMessages,
    missingCols,
    validCount:   dataRows.length - invalidCount,
    invalidCount,
  };
}

/**
 * Export an array of error objects to a CSV Blob for download.
 * @param {{ row: number, field: string, message: string }[]} errors
 */
export function exportErrorCSV(errors) {
  const ws   = XLSX.utils.json_to_sheet(errors.map(e => ({
    'Dòng': e.row, 'Cột': e.field, 'Lỗi': e.message,
  })));
  const wb   = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Errors');
  const buf  = XLSX.write(wb, { type: 'array', bookType: 'csv' });
  return new Blob([buf], { type: 'text/csv;charset=utf-8;' });
}

/** Trigger browser download of a Blob */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}