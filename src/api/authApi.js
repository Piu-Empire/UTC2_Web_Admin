import client from './axiosClient';

export const authApi = {
    /**
     * POST /api/v1/auth/login
     * Backend nhận { studentCode, password } — MSSV thuần (VD: 2211020001)
     * Backend trả  { accessToken, tokenType, email, studentCode }
     * Bọc trong ApiResponse: { code, message, data: {...} }
     */
    login: (studentCode, password) =>
        client.post('/auth/login', { studentCode, password }),
};