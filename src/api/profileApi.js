import client from './axiosClient';

export const profileApi = {
    /**
     * GET /api/v1/profile/me
     * Trả ProfileResponse: { id, studentId, username, email, fullName,
     *   phoneNumber, address, dateOfBirth, gender, faculty, major,
     *   academicYear, className, status, avatarUrl, studentCardUrl, role }
     */
    getMe: () => client.get('/profile/me'),

    /**
     * GET /api/v1/profile/student/:studentId
     * Tra cứu profile theo MSSV (dành cho admin)
     */
    getByStudentId: (studentId) => client.get(`/profile/student/${studentId}`),

    /**
     * PUT /api/v1/profile/me
     * Body: { fullName?, phone?, address?, dateOfBirth?, gender?, avatarUrl? }
     * LƯU Ý: field phone (không phải phoneNumber) theo UpdateProfileRequest
     */
    updateMe: (data) => client.put('/profile/me', data),
};