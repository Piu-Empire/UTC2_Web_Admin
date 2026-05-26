import client from './axiosClient';

export const academicApi = {
  // Lấy danh sách kỳ học của 1 sinh viên (admin dùng userId)
  getSemesters : (userId)             => client.get(`/academic/semesters`,              { params: { userId } }),
  getGrades    : (userId, semesterId) => client.get(`/academic/grades`,                 { params: { userId, semesterId } }),
  getLeaderboard:(semesterId, academicYear) => client.get(`/academic/leaderboard`,      { params: { semesterId, academicYear } }),
  getScholarships:(userId)            => client.get(`/academic/scholarships`,           { params: { userId } }),
  getWarnings  : (userId, semesterId) => client.get(`/academic/warnings`,               { params: { userId, semesterId } }),
};
