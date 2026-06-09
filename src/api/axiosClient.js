import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
    baseURL: `${API_URL}/api/v1`, // FIX: đổi từ /api/v1.0 → /api/v1 cho đúng backend
});

// Attach JWT token to every request
client.interceptors.request.use(cfg => {
    const token = localStorage.getItem('utc2_token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Auto-logout on 401
client.interceptors.response.use(
    res => res,
    err => {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('utc2_token');
            localStorage.removeItem('utc2_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default client;