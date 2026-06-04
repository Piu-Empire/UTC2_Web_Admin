// src/pages/import/ImportDormitoryPage.jsx
import GenericImportPage from '../../components/import/GenericImportPage';

// Khớp đúng với ImportServiceImpl.importDormitoryRooms():
//   Required: room_code, building, capacity, room_type, price_per_month
//   Optional: floor, status (mặc định: available), amenities
const REQUIRED_COLS = ['room_code', 'building', 'capacity', 'room_type', 'price_per_month'];

export default function ImportDormitoryPage() {
  return (
    <GenericImportPage
      title="Import Phòng Ký túc xá"
      description={
        'Upload file Excel / CSV chứa danh sách phòng ký túc xá. ' +
        'Cột bắt buộc: room_code, building, capacity, room_type, price_per_month. ' +
        'Cột tuỳ chọn: floor, status (mặc định: available), amenities.'
      }
      entity="dormitory-rooms"
      requiredCols={REQUIRED_COLS}
      sampleUrl="/samples/dormitory-rooms-sample.xlsx"
      viewDataPath="/"
    />
  );
}