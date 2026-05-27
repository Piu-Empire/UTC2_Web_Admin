import client from './axiosClient';

export const studentApi = {
    // Giữ nguyên API lấy danh sách của Admin
    list: (params) => client.get('/admin/students', { params }),

    // ĐỂ Ý CHỖ NÀY: id truyền vào là studentCode (MSSV), gọi đúng endpoint
    detail: (studentCode) => client.get(`/profile/student/${studentCode}`),
};