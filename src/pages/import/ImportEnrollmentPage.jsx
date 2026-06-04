// src/pages/import/ImportEnrollmentPage.jsx
import GenericImportPage from '../../components/import/GenericImportPage';

// Khớp đúng với ImportServiceImpl.importEnrollments():
//   Required: student_code, course_code, semester_id (số nguyên — KHÔNG phải semester_name)
//   Optional: status, midterm_score, final_score, assignment_score,
//             total_score, letter_grade, grade_point, is_passed
const REQUIRED_COLS = ['student_code', 'course_code', 'semester_id'];

export default function ImportEnrollmentPage() {
  return (
    <GenericImportPage
      title="Import Đăng ký học phần & Điểm"
      description={
        'Upload file Excel / CSV chứa dữ liệu đăng ký học phần và điểm số. ' +
        'Cột bắt buộc: student_code, course_code, semester_id (số nguyên). ' +
        'Cột tuỳ chọn: status, midterm_score, final_score, assignment_score, ' +
        'total_score, letter_grade, grade_point, is_passed.'
      }
      entity="enrollments"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/enrollments-sample.xlsx"
      viewDataPath="/students"
    />
  );
}
