import client from './axiosClient';

export const authApi = {
  // Response shape: { code, message, data: { token, role, name } }
  login: (email, password) =>
    client.post('/auth/login', { email, password }),
};