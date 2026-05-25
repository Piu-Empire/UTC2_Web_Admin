import client from './axiosClient';

export const studentApi = {
    // Giữ nguyên API lấy danh sách của Admin
    list: (params) => client.get('/admin/students', { params }),

    // ĐỂ Ý CHỖ NÀY: Sửa lại đường dẫn khớp với @GetMapping("/student/{studentId}") của ProfileController
    detail: (userId) => client.get(`/profile/student/${userId}`),
};