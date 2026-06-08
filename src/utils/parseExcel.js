import * as XLSX from 'xlsx';

const normalizeHeader = (str) => {
    if (!str) return '';
    return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/\*/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
};

export async function parseExcelFile(file, requiredCols = [], headerRow = null) {

    const buffer = await file.arrayBuffer();

    const wb = XLSX.read(buffer, {
        type: 'array',
        cellDates: true
    });

    const ws = wb.Sheets[wb.SheetNames[0]];

    const raw = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        defval: '',
        blankrows: true
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

    // Format any Date cells to dd/MM/yyyy
    for (let i = 0; i < raw.length; i++) {
        if (!raw[i]) continue;
        for (let j = 0; j < raw[i].length; j++) {
            if (raw[i][j] instanceof Date) {
                const d = raw[i][j];
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                raw[i][j] = `${day}/${month}/${year}`;
            }
        }
    }

    let resolvedHeaderRow = (headerRow !== undefined && headerRow !== null) ? headerRow : 7;

    if (!raw[resolvedHeaderRow]) resolvedHeaderRow = 0;

    // FIX BOM
    const headers = (raw[resolvedHeaderRow] || []).map(h => {
        const value =
            h !== undefined &&
            h !== null ?
            h :
            '';

        return String(value)
            .replace(/^\uFEFF/, '')
            .trim();
    });

    const lopHpIdx = headers.findIndex(h => normalizeHeader(h) === 'lop hoc phan');
    const maHpIdx = headers.findIndex(h => normalizeHeader(h) === 'ma hp' || normalizeHeader(h) === 'ma hoc phan');

    const dataRows = raw
        .slice(resolvedHeaderRow + 1)
        .filter(row => {
            const hasAnyVal = row.some(cell => {
                const value =
                    cell !== undefined &&
                    cell !== null ?
                    cell :
                    '';
                return String(value).trim() !== '';
            });
            if (!hasAnyVal) return false;

            if (lopHpIdx !== -1) {
                const val = row[lopHpIdx];
                if (val === undefined || val === null || String(val).trim() === '') {
                    return false;
                }
            } else if (maHpIdx !== -1) {
                const val = row[maHpIdx];
                if (val === undefined || val === null || String(val).trim() === '') {
                    return false;
                }
            }
            return true;
        });

    console.log(headers);
    console.log("FIRST DATA ROW =", dataRows[0]);

    dataRows.forEach((row, i) => {
        console.log("ROW", i, row);
    });
    const missingCols = requiredCols.filter(
        req =>
        !headers.some(
            h =>
            normalizeHeader(h) === normalizeHeader(req)
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

            const normalizedName = normalizeHeader(header);
            const isRequired =
                requiredCols.some(
                    rc =>
                    normalizeHeader(rc) === normalizedName
                ) && !['phong hoc', 'phong', 'phong thi', 'ngay bd', 'ngay bat dau', 'ngay kt', 'ngay ket thuc', 'ngay thi', 'giao vien', 'giang vien', 'nhom kiem soat', 'ghi chu', 'gio thi', 'gio thi 1'].includes(normalizedName);

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