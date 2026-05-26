import axios from 'axios';

// Academic endpoints dùng /api/v1 (backend Spring Boot)
// axiosClient dùng /api/v1.0 nên tạo instance riêng
const ac = axios.create({ baseURL: '/api/v1' });

ac.interceptors.request.use(cfg => {
  const token = localStorage.getItem('utc2_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

ac.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('utc2_token');
      localStorage.removeItem('utc2_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const academicApi = {
  getGrades:      (semesterId)              => ac.get('/academic/grades',      { params: semesterId ? { semesterId } : {} }),
  getSemesters:   ()                        => ac.get('/academic/semesters'),
  getLeaderboard: (semesterId, academicYear)=> ac.get('/academic/leaderboard', { params: { ...(semesterId ? { semesterId } : {}), ...(academicYear ? { academicYear } : {}) } }),
  getScholarships:()                        => ac.get('/academic/scholarships'),
  getWarnings:    (semesterId)              => ac.get('/academic/warnings',     { params: semesterId ? { semesterId } : {} }),
};