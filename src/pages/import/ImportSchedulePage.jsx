// src/pages/import/ImportSchedulePage.jsx (ghi đè placeholder)
import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = [
  'student_code', 'course_code', 'semester_name', 'start_date', 'end_date',
];

export default function ImportSchedulePage() {
  return (
    <GenericImportPage
      title="Import Thời khóa biểu"
      description="Upload file Excel / CSV chứa thời khóa biểu theo học kỳ. Bao gồm phòng học, tiết học, giảng viên và tuần học."
      entity="schedules"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/schedules-sample.xlsx"
      viewDataPath="/students"
    />
  );
}