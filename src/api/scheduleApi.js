import client from './axiosClient';

export const scheduleApi = {
  // API 4: Toàn bộ lịch
  getList: (params) => {
    return client.get('/admin/schedules', { params });
  },

  // API 2: Lọc theo lớp học phần
  getListBySection: (params) => {
    return client.get('/admin/schedules/by-section', { params });
  },

  // API 3: Lọc theo giảng viên
  getListByLecturer: (params) => {
    return client.get('/admin/schedules/by-lecturer', { params });
  },

  // Chi tiết 1 lịch
  getDetail: (id) => {
    return client.get(`/admin/schedules/${id}`);
  },

  // Tạo mới thủ công
  create: (data) => {
    return client.post('/admin/schedules', data);
  },

  // Cập nhật
  update: (id, data) => {
    return client.put(`/admin/schedules/${id}`, data);
  },

  // Xóa
  delete: (id) => {
    return client.delete(`/admin/schedules/${id}`);
  },

  // API 6: Upsert 1 lịch (tự phát hiện trùng, insert hoặc update)
  upsert: (data) => {
    return client.post('/admin/schedules/upsert', data);
  },

  // API 5: Upsert danh sách lịch
  bulkUpsert: (data) => {
    return client.post('/admin/schedules/bulk', data);
  },

  // Export Excel
  export: (params) => {
    return client.get('/admin/schedules/export', {
      params,
      responseType: 'blob',
    });
  },

  // Import Excel
  importExcel: (file, scheduleType, overwrite = false, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scheduleType', scheduleType);
    formData.append('overwrite', String(overwrite));

    return client.post('/admin/schedules/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    });
  },
};