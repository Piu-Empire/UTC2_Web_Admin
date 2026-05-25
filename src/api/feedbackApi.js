import client from './axiosClient';

// ── Status mapping ────────────────────────────────────────────────────
export const STATUS_LABEL = {
    'chưa đọc': 'Chưa đọc',
    'đã đọc': 'Đã đọc',
    'đã phản hồi': 'Đã phản hồi',
};

export const STATUS_VARIANT = {
    'chưa đọc': 'warning',
    'đã đọc': 'info',
    'đã phản hồi': 'success',
};

// ── Type mapping (khớp với DB cột `type`) ────────────────────────────
export const TYPE_LABEL = {
    'Lỗi': { label: 'Báo lỗi', variant: 'error' },
    'Góp ý': { label: 'Góp ý', variant: 'info' },
};

// ── Admin APIs ────────────────────────────────────────────────────────
export const feedbackApi = {
    /**
     * GET /api/v1/interaction/feedback/all
     * Query params: status?, page?, size?
     */
    list: (params) => client.get('/interaction/feedback/all', { params }),

    /**
     * PUT /api/v1/interaction/feedback/:id/reply
     * Body: { adminReply: string }
     */
    reply: (id, adminReply) =>
        client.put(`/interaction/feedback/${id}/reply`, { adminReply }),

    /**
     * PATCH /api/v1/interaction/feedback/:id/status
     * Body: { status: 'đã đọc' | 'đã phản hồi' }
     */
    updateStatus: (id, status) =>
        client.patch(`/interaction/feedback/${id}/status`, { status }),
};