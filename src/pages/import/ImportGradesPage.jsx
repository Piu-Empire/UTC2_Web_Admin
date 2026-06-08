import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['student_code', 'course_code', 'semester_name', 'midterm_score', 'final_score'];

export default function ImportGradesPage() {
  return (
    <GenericImportPage
      title="Import Điểm"
      description="Upload file Excel / CSV chứa dữ liệu điểm số sinh viên. Bao gồm điểm giữa kỳ, cuối kỳ và điểm bài tập."
      entity="grades"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/grades-sample.xlsx"
      viewDataPath="/academic/grades"
    />
  );
}