// src/pages/import/ImportCurriculumPage.jsx
import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['major', 'academic_year', 'course_code', 'semester_suggestion'];

export default function ImportCurriculumPage() {
  return (
    <GenericImportPage
      title="Import Chương trình đào tạo"
      description="Upload file Excel / CSV chứa chương trình đào tạo theo ngành và khóa học. Mỗi dòng là một học phần trong chương trình. Lưu ý: course_code phải tồn tại sẵn trong hệ thống."
      entity="curriculum"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/curriculum-sample.xlsx"
      viewDataPath="/students"
    />
  );
}