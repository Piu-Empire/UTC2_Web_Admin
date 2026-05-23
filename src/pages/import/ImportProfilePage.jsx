// src/pages/import/ImportProfilePage.jsx
import GenericImportPage from '../../components/import/GenericImportPage';

// Backend required: student_code (dùng để tra cứu sinh viên)
// Optional: full_name, phone_number, date_of_birth, gender, address,
//           faculty, major, academic_year, class_name, status
const REQUIRED_COLS = ['student_code'];

export default function ImportProfilePage() {
  return (
    <GenericImportPage
      title="Import / Cập nhật Profile sinh viên"
      description="Upload file Excel / CSV để cập nhật thông tin hồ sơ sinh viên đã có trong hệ thống. Cột student_code là bắt buộc để tra cứu. Các cột còn lại (full_name, phone_number, date_of_birth, gender, address, faculty, major, academic_year, class_name, status) là tuỳ chọn — chỉ cập nhật cột nào có giá trị."
      entity="profiles"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/profiles-sample.xlsx"
      viewDataPath="/students"
    />
  );
}