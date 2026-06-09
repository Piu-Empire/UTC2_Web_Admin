import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import ImportDormitoryPage from '../pages/import/ImportDormitoryPage';
import DashboardPage           from '../pages/DashboardPage';
import ImportStudentPage       from '../pages/import/ImportStudentPage';
import ImportCoursePage        from '../pages/import/ImportCoursePage';
import ImportEnrollmentPage    from '../pages/import/ImportEnrollmentPage';
import ImportFeePage           from '../pages/import/ImportFeePage';
import ImportCurriculumPage    from '../pages/import/ImportCurriculumPage';
import ImportProfilePage       from '../pages/import/ImportProfilePage';
import StudentListPage         from '../pages/students/StudentListPage';
import StudentDetailPage       from '../pages/students/StudentDetailPage';
import NotificationPage        from '../pages/NotificationPage';
import FeedbackPage            from '../pages/FeedbackPage';
import ServiceRequestPage           from '../pages/ServiceRequestPage';
import DormitoryRegistrationPage   from '../pages/dormitory/DormitoryRegistrationPage';

// Schedules
import ScheduleListPage from '../pages/schedules/ScheduleListPage';
import ImportSchedulePage from '../pages/schedules/ImportSchedulePage';
import ExportSchedulePage from '../pages/schedules/ExportSchedulePage';
import ScheduleFormPage from '../pages/schedules/ScheduleFormPage';

// Academic pages
import AcademicResultPage      from '../pages/academic/AcademicResultPage';
import GradesPage              from '../pages/academic/GradesPage';
import LeaderboardPage         from '../pages/academic/LeaderboardPage';
import ScholarshipPage         from '../pages/academic/ScholarshipPage';
import WarningPage             from '../pages/academic/WarningPage';
import ImportGradesPage        from '../pages/import/ImportGradesPage';
import ImportTeacherCoursePage  from '../pages/import/ImportTeacherCoursePage';
import TeacherCoursePage        from '../pages/academic/TeacherCoursePage';
// Assessment
import AssessmentPage          from '../pages/assessment/AssessmentPage';

function getUser() {
  try { return JSON.parse(localStorage.getItem('utc2_user') || '{}'); }
  catch { return {}; }
}

function RequireAuth({ children }) {
  const token = localStorage.getItem('utc2_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireServiceRequestAccess({ children }) {
  const token = localStorage.getItem('utc2_token');
  if (!token) return <Navigate to="/login" replace />;
  const { role, staffLevel } = getUser();
  const allowed = role === 'ADMIN' || (role === 'STAFF' && staffLevel >= 5);
  if (!allowed) return <Navigate to="/" replace />;
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
            <Route path="students" element={<ImportStudentPage />} />
            <Route path="courses" element={<ImportCoursePage />} />
            <Route path="enrollments" element={<ImportEnrollmentPage />} />
            <Route path="fees" element={<ImportFeePage />} />
            <Route path="curriculum" element={<ImportCurriculumPage />} />
            <Route path="profiles" element={<ImportProfilePage />} />

            <Route path="dormitory" element={<ImportDormitoryPage />} />

            <Route path="grades" element={<ImportGradesPage />} />
            <Route path="teacher-courses" element={<ImportTeacherCoursePage />} />
          </Route>

          <Route path="schedules">
            <Route index element={<ScheduleListPage />} />
            <Route path="import" element={<ImportSchedulePage />} />
            <Route path="export" element={<ExportSchedulePage />} />
            <Route path="create" element={<ScheduleFormPage />} />
            <Route path=":id" element={<ScheduleFormPage />} />
          </Route>

          <Route path="academic">
            <Route path="results"      element={<AcademicResultPage />} />
            <Route path="grades"       element={<GradesPage />} />
            <Route path="leaderboard"  element={<LeaderboardPage />} />
            <Route path="scholarships" element={<ScholarshipPage />} />
            <Route path="warnings"     element={<WarningPage />} />
            <Route path="teacher-courses" element={<TeacherCoursePage />} />
          </Route>
                    <Route path="assessment" element={<AssessmentPage />} />

          <Route path="notifications" element={<NotificationPage />} />

          <Route path="feedback" element={<FeedbackPage />} />

          <Route
            path="service-requests"
            element={
              <RequireServiceRequestAccess>
                <ServiceRequestPage />
              </RequireServiceRequestAccess>
            }
          />

          <Route path="dormitory">
            <Route
              path="registrations"
              element={<DormitoryRegistrationPage />}
            />
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}