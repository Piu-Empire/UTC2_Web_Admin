// src/pages/import/ImportCurriculumPage.jsx (ghi đè placeholder)
import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['major', 'academic_year', 'course_code', 'semester_suggestion'];

export default function ImportCurriculumPage() {
  return (
    <GenericImportPage
      title="Import Chương trình đào tạo"
      description="Upload file Excel / CSV chứa chương trình đào tạo theo ngành và khóa học. Mỗi dòng là một học phần trong chương trình."
      entity="curriculum"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/curriculum-sample.xlsx"
      viewDataPath="/students"
    />
  );
}