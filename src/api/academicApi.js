import client from './axiosClient';

export const academicApi = {
  // Student / read
  getSemesters:   (userId)                  => client.get('/academic/semesters',        { params: { userId } }),
  getGrades:      (userId, semesterId)       => client.get('/academic/grades',           { params: { userId, semesterId } }),
  getLeaderboard: (semesterId, academicYear) => client.get('/academic/leaderboard',      { params: { semesterId, academicYear } }),
  getScholarships:(userId)                   => client.get('/academic/scholarships',     { params: { userId } }),
  getWarnings:    (userId, semesterId)       => client.get('/academic/warnings',         { params: { userId, semesterId } }),

  // STAFF lv2 — giảng viên nhập điểm theo môn + lớp
  getGradesByCourse: (courseId, className)  => client.get('/academic/grades/by-course', { params: { courseId, className } }),
  updateGrade:       (enrollmentId, data)   => client.put(`/academic/grades/${enrollmentId}`, data),

  // ADVISOR — cố vấn học tập
  upsertWarning:          (data)            => client.post('/academic/warnings',          data),
  deleteWarning:          (warningId)       => client.delete(`/academic/warnings/${warningId}`),
  updateScholarshipStatus:(data)            => client.put('/academic/scholarships/status', data),
};