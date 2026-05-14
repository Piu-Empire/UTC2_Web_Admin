import client from './axiosClient';

export const feedbackApi = {
  list: (params) => client.get('/admin/feedback', { params }),
  reply: (id, reply) => client.put(`/admin/feedback/${id}/reply`, { reply }),
};
