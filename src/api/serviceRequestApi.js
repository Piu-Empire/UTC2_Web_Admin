import client from './axiosClient';

// ── Status mapping: backend enum → label tiếng Việt ─────────────────
export const STATUS_LABEL = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    REJECTED: 'Từ chối',
};

export const STATUS_VARIANT = {
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    REJECTED: 'error',
};

// Tất cả enum giá trị backend chấp nhận
export const ALL_STATUSES = Object.keys(STATUS_LABEL);

// ── Service type mapping ─────────────────────────────────────────────
export const SERVICE_TYPE_LABEL = {
    TRANSCRIPT: 'Cấp bảng điểm',
    CONFIRMATION_LETTER: 'Xác nhận sinh viên',
    CARD_REISSUE: 'Cấp lại thẻ SV',
    LOAN_SUPPORT: 'Hỗ trợ vay vốn',
};

// ── Admin APIs (quản lý tất cả yêu cầu) ─────────────────────────────
export const serviceRequestApi = {
    /**
     * GET /api/v1/admin/service-requests
     * Query params: status?, page?, size?, sort?
     */
    list: (params) => client.get('/admin/service-requests', { params }),

    /**
     * PUT /api/v1/admin/service-requests/:id/status
     * Body: { status: 'PENDING'|'PROCESSING'|'COMPLETED'|'REJECTED', resultNote? }
     */
    updateStatus: (id, payload) =>
        client.put(`/admin/service-requests/${id}/status`, payload),
};

// ── Student-facing APIs (sinh viên tự nộp) ──────────────────────────
// Dành cho tương lai nếu admin muốn nộp thay sinh viên hoặc test
export const publicServicesApi = {
    /** POST /api/v1/services/card-reissue   Body: { reason? } */
    cardReissue: (data) => client.post('/services/card-reissue', data),

    /** POST /api/v1/services/loan-support   Body: { loanAmount, loanReason, phoneNumber } */
    loanSupport: (data) => client.post('/services/loan-support', data),

    /** POST /api/v1/services/transcript     Body: { academicYear, semester, quantity, note? } */
    transcript: (data) => client.post('/services/transcript', data),

    /** POST /api/v1/services/student-confirmation  Body: { purpose, quantity? } */
    studentConfirmation: (data) => client.post('/services/student-confirmation', data),

    /** GET /api/v1/services/my-requests */
    myRequests: () => client.get('/services/my-requests'),

    /** GET /api/v1/services/my-requests/:type */
    myRequestsByType: (type) => client.get(`/services/my-requests/${type}`),
};