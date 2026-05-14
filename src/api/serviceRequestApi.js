import client from './axiosClient';

export const serviceRequestApi = {
  list: (params) => client.get('/admin/service-requests', { params }),
  updateStatus: (id, payload) =>
    client.put(`/admin/service-requests/${id}/status`, payload),
};
