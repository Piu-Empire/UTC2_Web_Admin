// src/pages/import/ImportFeePage.jsx (ghi đè placeholder)
import GenericImportPage from '../../components/import/GenericImportPage';

const REQUIRED_COLS = ['student_code', 'semester_name', 'total_amount'];

export default function ImportFeePage() {
  return (
    <GenericImportPage
      title="Import Học phí"
      description="Upload file Excel / CSV chứa thông tin học phí theo từng học kỳ. Bao gồm số tiền phải đóng, đã đóng và hạn nộp."
      entity="fees"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/fees-sample.xlsx"
      viewDataPath="/students"
    />
  );
}