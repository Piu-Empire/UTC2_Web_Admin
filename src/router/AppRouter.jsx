import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';

import DashboardPage        from '../pages/DashboardPage';
import ImportStudentPage    from '../pages/import/ImportStudentPage';
import ImportCoursePage     from '../pages/import/ImportCoursePage';
import ImportEnrollmentPage from '../pages/import/ImportEnrollmentPage';
import ImportSchedulePage   from '../pages/import/ImportSchedulePage';
import ImportFeePage        from '../pages/import/ImportFeePage';
import ImportCurriculumPage from '../pages/import/ImportCurriculumPage';
import ImportProfilePage    from '../pages/import/ImportProfilePage';
import StudentListPage      from '../pages/students/StudentListPage';
import StudentDetailPage    from '../pages/students/StudentDetailPage';
import NotificationPage     from '../pages/NotificationPage';
import FeedbackPage         from '../pages/FeedbackPage';
import ServiceRequestPage   from '../pages/ServiceRequestPage';

// Academic pages
import AcademicResultPage   from '../pages/academic/AcademicResultPage';
import GradesPage           from '../pages/academic/GradesPage';
import LeaderboardPage      from '../pages/academic/LeaderboardPage';
import ScholarshipPage      from '../pages/academic/ScholarshipPage';
import WarningPage          from '../pages/academic/WarningPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('utc2_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage />} />

          <Route path="import">
            <Route path="students"    element={<ImportStudentPage />} />
            <Route path="courses"     element={<ImportCoursePage />} />
            <Route path="enrollments" element={<ImportEnrollmentPage />} />
            <Route path="schedules"   element={<ImportSchedulePage />} />
            <Route path="fees"        element={<ImportFeePage />} />
            <Route path="curriculum"  element={<ImportCurriculumPage />} />
            <Route path="profiles"    element={<ImportProfilePage />} />
          </Route>

          <Route path="students">
            <Route index element={<StudentListPage />} />
            <Route path=":id" element={<StudentDetailPage />} />
          </Route>

          {/* Academic routes */}
          <Route path="academic">
            <Route path="results"     element={<AcademicResultPage />} />
            <Route path="grades"      element={<GradesPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="scholarships"element={<ScholarshipPage />} />
            <Route path="warnings"    element={<WarningPage />} />
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
