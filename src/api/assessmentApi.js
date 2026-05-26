import client from './axiosClient';

export const assessmentApi = {
  getPeriods:          ()           => client.get('/assessment/periods'),
  adminGetStudent:     (periodId)   => client.get('/assessment/admin/student',  { params: { periodId } }),
  adminGetAdvisor:     (periodId)   => client.get('/assessment/admin/advisor',  { params: { periodId } }),
  importExternal:      (body)       => client.post('/assessment/external/import', body),
};