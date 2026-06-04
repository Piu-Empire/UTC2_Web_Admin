import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';

import DashboardPage           from '../pages/DashboardPage';
import ImportStudentPage       from '../pages/import/ImportStudentPage';
import ImportCoursePage        from '../pages/import/ImportCoursePage';
import ImportEnrollmentPage    from '../pages/import/ImportEnrollmentPage';
import ImportSchedulePage      from '../pages/import/ImportSchedulePage';
import ImportFeePage           from '../pages/import/ImportFeePage';
import ImportCurriculumPage    from '../pages/import/ImportCurriculumPage';
import ImportProfilePage       from '../pages/import/ImportProfilePage';
import StudentListPage         from '../pages/students/StudentListPage';
import StudentDetailPage       from '../pages/students/StudentDetailPage';
import NotificationPage        from '../pages/NotificationPage';
import FeedbackPage            from '../pages/FeedbackPage';
import ServiceRequestPage      from '../pages/ServiceRequestPage';

// Academic pages
import AcademicResultPage      from '../pages/academic/AcademicResultPage';
import GradesPage              from '../pages/academic/GradesPage';
import LeaderboardPage         from '../pages/academic/LeaderboardPage';
import ScholarshipPage         from '../pages/academic/ScholarshipPage';
import WarningPage             from '../pages/academic/WarningPage';
import AdvisorWarningPage      from '../pages/academic/AdvisorWarningPage';
import AdvisorScholarshipPage  from '../pages/academic/AdvisorScholarshipPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('utc2_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Chỉ ADMIN hoặc STAFF lv5 mới được vào các trang import
function RequireImport({ children }) {
  const token = localStorage.getItem('utc2_token');
  if (!token) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(localStorage.getItem('utc2_user') || '{}');
    const { role, staffLevel } = user;
    const allowed = role === 'ADMIN' || (role === 'STAFF' && staffLevel >= 5);
    if (!allowed) return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />

          <Route path="import">
            <Route path="students"    element={<RequireImport><ImportStudentPage /></RequireImport>} />
            <Route path="courses"     element={<RequireImport><ImportCoursePage /></RequireImport>} />
            <Route path="enrollments" element={<RequireImport><ImportEnrollmentPage /></RequireImport>} />
            <Route path="schedules"   element={<RequireImport><ImportSchedulePage /></RequireImport>} />
            <Route path="fees"        element={<RequireImport><ImportFeePage /></RequireImport>} />
            <Route path="curriculum"  element={<RequireImport><ImportCurriculumPage /></RequireImport>} />
            <Route path="profiles"    element={<RequireImport><ImportProfilePage /></RequireImport>} />
          </Route>

          <Route path="students">
            <Route index element={<StudentListPage />} />
            <Route path=":id" element={<StudentDetailPage />} />
          </Route>

          <Route path="academic">
            {/* ADMIN / xem tổng quan */}
            <Route path="results"      element={<AcademicResultPage />} />
            <Route path="leaderboard"  element={<LeaderboardPage />} />
            <Route path="scholarships" element={<ScholarshipPage />} />
            <Route path="warnings"     element={<WarningPage />} />

            {/* STAFF lv2: nhập điểm theo môn */}
            <Route path="grades"       element={<GradesPage />} />

            {/* ADVISOR: quản lý warning + scholarship */}
            <Route path="advisor/warnings"     element={<AdvisorWarningPage />} />
            <Route path="advisor/scholarships" element={<AdvisorScholarshipPage />} />
          </Route>

          <Route path="notifications"    element={<NotificationPage />} />
          <Route path="feedback"         element={<FeedbackPage />} />
          <Route path="service-requests" element={<ServiceRequestPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}