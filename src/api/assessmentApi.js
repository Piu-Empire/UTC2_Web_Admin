import client from './axiosClient';

export const assessmentApi = {
  // Học kỳ
  getPeriods:            ()       => client.get('/assessment/periods'),

  // Admin xem
  adminGetStudent:       (periodId) => client.get('/assessment/admin/student',  { params: { periodId } }),
  adminGetAdvisor:       (periodId) => client.get('/assessment/admin/advisor',  { params: { periodId } }),
  adminGetOverview:      (periodId) => client.get('/assessment/admin/overview', { params: { periodId } }),

  // Nhập điểm theo role
  setTapThe:  (body) => client.put('/assessment/external/tap-the', body),
  setBoMon:   (body) => client.put('/assessment/external/bo-mon',  body),
  setKhoa:    (body) => client.put('/assessment/external/khoa',    body),
  setTruong:  (body) => client.put('/assessment/external/truong',  body),

  // Duyệt
  approveAdvisor: (body) => client.post('/assessment/external/approve/advisor', body),
  approveKhoa:    (body) => client.post('/assessment/external/approve/khoa',    body),
  approveTruong:  (body) => client.post('/assessment/external/approve/truong',  body),
};