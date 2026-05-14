// src/pages/import/ImportEnrollmentPage.jsx (ghi đè placeholder)
import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['student_code', 'course_code', 'semester_name'];

export default function ImportEnrollmentPage() {
  return (
    <GenericImportPage
      title="Import Đăng ký học phần & Điểm"
      description="Upload file Excel / CSV chứa dữ liệu đăng ký học phần và điểm số. Bao gồm điểm giữa kỳ, cuối kỳ và trạng thái."
      entity="enrollments"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/enrollments-sample.xlsx"
      viewDataPath="/students"
    />
  );
}