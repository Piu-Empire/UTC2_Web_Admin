import client from './axiosClient';

export const studentApi = {
  list: (params) => client.get('/admin/students', { params }),
  detail: (userId) => client.get(`/admin/students/${userId}`),
};
