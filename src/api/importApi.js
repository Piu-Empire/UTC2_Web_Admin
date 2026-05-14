// src/api/importApi.js (ghi đè)
import client from './axiosClient';

/**
 * Upload file to backend import endpoint.
 *
 * @param {'students'|'courses'|'enrollments'|'schedules'|'fees'|'curriculum'} entity
 * @param {File}     file
 * @param {boolean}  overwrite
 * @param {(pct: number) => void} [onProgress]
 * @returns {Promise<{ success: number, failed: number, errors: {row,field,message}[] }>}
 */
export async function uploadImport(entity, file, overwrite = false, onProgress) {
  const form = new FormData();
  form.append('file', file);
  form.append('overwrite', String(overwrite));

  const res = await client.post(`/admin/import/${entity}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total));
    },
  });

  // Normalise response: { code, message, data: { success, failed, errors } }
  return res.data?.data ?? res.data;
}