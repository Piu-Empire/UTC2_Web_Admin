import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['user_id', 'course_id', 'semester_id', 'class_name'];

export default function ImportTeacherCoursePage() {
  return (
    <GenericImportPage
      title="Import Phân công giảng viên"
      description="Upload file Excel chứa thông tin phân công giảng viên dạy môn. Cần đủ cột: user_id, course_id, semester_id, class_name."
      entity="teacher-courses"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/teacher-course-sample.xlsx"
      viewDataPath="/academic/teacher-courses"
    />
  );
}