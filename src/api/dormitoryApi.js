// src/api/dormitoryApi.js
import client from './axiosClient';

// ── Trạng thái đăng ký KTX ────────────────────────────────────────────
export const REG_STATUS = {
  PENDING:   'chờ duyệt',
  APPROVED:  'đã duyệt',
  REJECTED:  'đã từ chối',
  CANCELLED: 'đã hủy',
};

export const REG_STATUS_VARIANT = {
  'chờ duyệt':   'warning',
  'đã duyệt':    'success',
  'đã từ chối':  'error',
  'từ chối':     'error',
  'đã hủy':      'neutral',
};

export const ALL_REG_STATUSES = Object.values(REG_STATUS);

// ── Admin API ─────────────────────────────────────────────────────────
export const dormitoryAdminApi = {
  /**
   * GET /api/v1/dorm-registrations
   * Lấy toàn bộ đăng ký KTX
   */
  listRegistrations: (params) =>
    client.get('/dorm-registrations', { params }),

  /**
   * GET /api/v1/dorm-registrations/pending
   * Chỉ lấy đăng ký chờ duyệt
   */
  listPending: () =>
    client.get('/dorm-registrations/pending'),

  /**
   * POST /api/v1/dorm-registrations/:id/approve
   * Admin duyệt → sinh viên thấy số tiền cần thanh toán
   */
  approve: (id) =>
    client.post(`/dorm-registrations/${id}/approve`),

  /**
   * POST /api/v1/dorm-registrations/:id/reject
   * Body: { reason? }
   */
  reject: (id, reason) =>
    client.post(`/dorm-registrations/${id}/reject`, { reason }),

  /**
   * updateStatus — wrapper tương thích với Drawer (gọi approve/reject tương ứng)
   */
  updateStatus: async (id, payload) => {
    if (payload.status === 'đã duyệt') {
      return client.post(`/dorm-registrations/${id}/approve`);
    }
    if (payload.status === 'từ chối' || payload.status === 'đã từ chối') {
      return client.post(`/dorm-registrations/${id}/reject`, { reason: payload.note });
    }
    throw new Error('Trạng thái không hợp lệ: ' + payload.status);
  },
};