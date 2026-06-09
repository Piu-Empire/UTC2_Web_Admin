import client from './axiosClient';

export const academicApi = {
  // ── Read (tất cả role) ────────────────────────────────────────────────
  getSemesters:   (userId)                   => client.get('/academic/semesters',    { params: { userId } }),
  getGrades:      (userId, semesterId)        => client.get('/academic/grades',       { params: { userId, semesterId } }),
  getLeaderboard: (semesterId, academicYear)  => client.get('/academic/leaderboard', { params: { semesterId, academicYear } }),
  getScholarships:(userId)                    => client.get('/academic/scholarships', { params: { userId } }),
  getWarnings:    (userId, semesterId)        => client.get('/academic/warnings',     { params: { userId, semesterId } }),

  // ── Nhập điểm (lv2 + admin) ──────────────────────────────────────────
  getGradesByCourse: (courseId, className)   => client.get('/academic/grades/by-course', { params: { courseId, className } }),
  updateGrade:       (enrollmentId, data)    => client.put(`/academic/grades/${enrollmentId}`, data),

  // ── lv3+ / Advisor: tạo warning & scholarship ───────────────────────
  upsertWarning:           (data)            => client.post('/academic/warnings',           data),
  deleteWarning:           (warningId)       => client.delete(`/academic/warnings/${warningId}`),
  upsertScholarship:       (data)            => client.put('/academic/scholarships/status', data),
  updateScholarshipStatus: (data)            => client.put('/academic/scholarships/status', data),

  // ── lv5 + admin: duyệt ───────────────────────────────────────────────
  // Warning
  approveWarning:      (warningId)           => client.post(`/academic/warnings/${warningId}/approve`),
  getPendingWarnings:  ()                    => client.get('/academic/warnings/pending'),

  // Scholarship
  approveScholarship:      (userId, scholarshipId) => client.post('/academic/scholarships/approve',  null, { params: { userId, scholarshipId } }),
  markScholarshipReceived: (userId, scholarshipId) => client.post('/academic/scholarships/received', null, { params: { userId, scholarshipId } }),
  getPendingScholarships:  ()                      => client.get('/academic/scholarships/pending'),

  // Leaderboard (read only, không còn approve)
  approveLeaderboard:   (semesterId)         => client.post('/academic/leaderboard/approve',  null, { params: { semesterId } }),
  revokeLeaderboard:    (semesterId)         => client.delete('/academic/leaderboard/approve',      { params: { semesterId } }),
  getPendingLeaderboard:(semesterId, academicYear) => client.get('/academic/leaderboard/pending', { params: { semesterId, academicYear } }),

  // ── Teacher course ────────────────────────────────────────────────────
  getTeacherCourses:   (userId)              => client.get('/academic/teacher-courses', { params: { userId } }),
  assignTeacher:       (userId, courseId, semesterId, className) =>
                         client.post('/academic/teacher-courses', null, { params: { userId, courseId, semesterId, className } }),
  removeTeacherCourse: (id)                 => client.delete(`/academic/teacher-courses/${id}`),
};