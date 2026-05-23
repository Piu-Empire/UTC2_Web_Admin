// src/pages/import/ImportCoursePage.jsx
import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['course_code', 'course_name', 'credits'];

export default function ImportCoursePage() {
  return (
    <GenericImportPage
      title="Import Học phần"
      description="Upload file Excel / CSV chứa danh sách học phần. Mã học phần (course_code) là khoá chính định danh duy nhất."
      entity="courses"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/courses-sample.xlsx"
      viewDataPath="/students"
    />
  );
}