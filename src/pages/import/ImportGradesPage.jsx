import GenericImportPage from '../../components/import/GenericImportPage';

// Cột bắt buộc: header ở dòng 1 (headerRow=0), không có metadata phía trên
const REQUIRED_COLS = ['student_code', 'course_code', 'semester_name', 'midterm_score', 'final_score'];

export default function ImportGradesPage() {
  return (
    <GenericImportPage
      title="Import Điểm"
      description="Upload file Excel / CSV chứa dữ liệu điểm số sinh viên. Header ở dòng đầu tiên. Cột bắt buộc: student_code, course_code, semester_name, midterm_score, final_score."
      entity="grades"
      requiredCols={REQUIRED_COLS}
      headerRow={0}
      sampleUrl="/samples/grades-sample.xlsx"
      viewDataPath="/academic/grades"
    />
  );
}