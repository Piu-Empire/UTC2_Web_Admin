import client from './axiosClient';

export const notificationApi = {
  list: (params) => client.get('/admin/notifications', { params }),
  create: (payload) => client.post('/admin/notifications', payload),
};
