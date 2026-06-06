import client from './axiosClient';

async function downloadFile(url, filename) {
    const res = await client.get(url, { responseType: 'blob' });
    const href = URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
}

export function exportEnrollments() {
    return downloadFile('/export/enrollment', `dang-ky-hoc-phan-${new Date().toISOString().slice(0,10)}.xlsx`);
}

export function exportDormitory() {
    return downloadFile('/export/dormitory', `dang-ky-ktx-${new Date().toISOString().slice(0,10)}.xlsx`);
}