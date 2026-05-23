// src/utils/parseExcel.js
import * as XLSX from 'xlsx';

export async function parseExcelFile(file, requiredCols = []) {

    const buffer = await file.arrayBuffer();

    const wb = XLSX.read(buffer, {
        type: 'array',
        cellDates: true
    });

    const ws = wb.Sheets[wb.SheetNames[0]];

    const raw = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: '',
        blankrows: false
    });

    if (!raw || raw.length < 1) {
        return {
            headers: [],
            rows: [],
            rawRows: [],
            errorCells: new Set(),
            cellMessages: {},
            missingCols: requiredCols,
            validCount: 0,
            invalidCount: 0
        };
    }

    // FIX BOM
    const headers = raw[0].map(h => {
        const value =
            h !== undefined &&
            h !== null ?
            h :
            '';

        return String(value)
            .replace(/^\uFEFF/, '')
            .trim();
    });

    const dataRows = raw
        .slice(1)
        .filter(row =>
            row.some(cell => {

                const value =
                    cell !== undefined &&
                    cell !== null ?
                    cell :
                    '';

                return String(value)
                    .trim() !== '';
            })
        );

    console.log(headers);
    console.log("FIRST DATA ROW =", dataRows[0]);

    dataRows.forEach((row, i) => {
        console.log("ROW", i, row);
    });
    const missingCols = requiredCols.filter(
        req =>
        !headers.some(
            h =>
            h.toLowerCase().trim() ===
            req.toLowerCase().trim()
        )
    );

    const errorCells = new Set();

    const cellMessages = {};

    const rowObjects = [];

    let invalidCount = 0;

    dataRows.forEach((row, ri) => {

        const obj = {};

        let rowHasError = false;

        headers.forEach((header, ci) => {

            const val =
                row[ci] !== undefined &&
                row[ci] !== null ?
                row[ci] :
                '';

            obj[header] = val;

            const isRequired =
                requiredCols.some(
                    rc =>
                    rc.toLowerCase() ===
                    header.toLowerCase()
                );

            if (
                isRequired &&
                String(val).trim() === ''
            ) {

                const key =
                    `${ri}-${ci}`;

                errorCells.add(key);

                cellMessages[key] =
                    `Cột "${header}" là bắt buộc`;

                rowHasError = true;
            }

            if (
                header
                .toLowerCase()
                .includes('email') &&
                String(val).trim() !== ''
            ) {

                const emailRegex =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(
                        String(val)
                    )) {

                    const key =
                        `${ri}-${ci}`;

                    errorCells.add(key);

                    cellMessages[key] =
                        'Sai định dạng email';

                    rowHasError = true;
                }
            }

            if (
                (
                    header
                    .toLowerCase()
                    .includes('score') ||
                    header
                    .toLowerCase()
                    .includes('diem')
                ) &&
                String(val).trim() !== ''
            ) {

                const num =
                    Number(val);

                if (
                    isNaN(num) ||
                    num < 0 ||
                    num > 10
                ) {

                    const key =
                        `${ri}-${ci}`;

                    errorCells.add(key);

                    cellMessages[key] =
                        'Điểm phải trong khoảng 0–10';

                    rowHasError = true;
                }
            }

        });

        if (rowHasError) {
            invalidCount++;
        }

        rowObjects.push(obj);

    });

    return {
        headers,
        rows: rowObjects,
        rawRows: dataRows,
        errorCells,
        cellMessages,
        missingCols,
        validCount: dataRows.length -
            invalidCount,
        invalidCount
    };

}

export function exportErrorCSV(errors) {

    const ws =
        XLSX.utils.json_to_sheet(
            errors.map(
                e => ({
                    'Dòng': e.row,
                    'Cột': e.field,
                    'Lỗi': e.message
                })
            )
        );

    const wb =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        'Errors'
    );

    const buf =
        XLSX.write(
            wb, {
                type: 'array',
                bookType: 'csv'
            }
        );

    return new Blob(
        [buf], {
            type: 'text/csv;charset=utf-8;'
        }
    );

}

export function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );

    const a =
        document.createElement(
            'a'
        );

    a.href = url;

    a.download =
        filename;

    a.click();

    URL.revokeObjectURL(
        url
    );

}