// src/pages/students/StudentListPage.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Search, Download, Upload, Eye, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

import DataTable  from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge      from '../../components/common/Badge';
import Button     from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { initials, gpaColor, statusVariant } from '../../utils/formatters';
import { studentApi } from '../../api/studentApi';

const PAGE_SIZE = 10;
const col = createColumnHelper();
const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

// Các danh mục bộ lọc chuẩn hóa theo thiết kế của hệ thống Backend
const FACULTIES = ['Công nghệ TT', 'Cơ khí', 'Điện - Điện tử', 'Kinh tế vận tải', 'Công trình giao thông'];
const COHORTS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];
const STATUSES = ['đang học', 'bảo lưu', 'đình chỉ', 'đã tốt nghiệp'];

function AvatarName({ name }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-brand-700">{initials(name || '—')}</span>
      </div>
      <span className="font-medium text-sm text-ink">{name || 'Chưa cập nhật tên'}</span>
    </div>
  );
}

export default function StudentListPage() {
  const navigate = useNavigate();

  // State quản lý dữ liệu thực tế nhận từ server
  const [students, setStudents] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // State quản lý bộ lọc tìm kiếm và phân trang
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState('');
  const [cohort, setCohort] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const timer = useRef(null);

  // Xử lý debounce tìm kiếm trong khoảng 400ms để tránh spam request liên tục lên server
  function handleSearch(val) {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setQuery(val);
      setPage(0);
    }, 400);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  // Tự động đưa về trang đầu tiên nếu Admin thay đổi một trong các dropdown filter
  useEffect(() => {
    setPage(0);
  }, [faculty, cohort, status]);

  // Hàm thực hiện gọi API lấy dữ liệu động từ Backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        search: query || undefined,
        faculty: faculty || undefined,
        cohort: cohort || undefined,
        status: status || undefined,
        page: page,
        size: PAGE_SIZE
      };

      const response = await studentApi.list(params);
      
      // Bóc tách cấu trúc phân trang Page của Spring Data
      const pageData = response?.data ? response.data : response;

      if (pageData && pageData.content) {
        setStudents(pageData.content);
        setTotalElements(pageData.totalElements);
      } else {
        setStudents([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Lỗi khi fetch danh sách sinh viên từ hệ thống: ', error);
      setStudents([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe thay đổi của các filter để tự động gọi lại hàm cập nhật dữ liệu
  useEffect(() => {
    fetchStudents();
  }, [query, faculty, cohort, status, page]);

  // Xuất file dữ liệu báo cáo Excel trực tiếp dựa trên trang danh sách thực tế hiện tại
  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      'MSSV': s.studentCode,
      'Họ và tên': s.fullName || 'Chưa cập nhật tên',
      'Khoa': s.faculty || '—',
      'Khóa': s.cohort || '—',
      'GPA': s.gpa !== null ? s.gpa : '—',
      'Trạng thái': s.status,
      'Email': s.email || '—'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sinh viên');
    XLSX.writeFile(wb, 'danh-sach-sinh-vien.xlsx');
  }

  const columns = useMemo(() => [
    col.accessor('studentCode', {
      header: 'MSSV',
      cell: i => <span className="font-mono text-xs text-ink-subtle">{i.getValue()}</span>,
    }),
    col.accessor('fullName', {
      header: 'Họ và tên',
      cell: i => <AvatarName name={i.getValue()} />,
    }),
    col.accessor('faculty', { 
      header: 'Khoa',
      cell: i => <span>{i.getValue() || '—'}</span>,
    }),
    col.accessor('cohort',  { 
      header: 'Khóa',
      cell: i => <span>{i.getValue() || '—'}</span>,
    }),
    col.accessor('gpa', {
      header: 'GPA',
      cell: i => {
        const v = i.getValue();
        return <span className={gpaColor(v)}>{v !== null && v !== undefined ? v.toFixed(2) : '—'}</span>;
      },
    }),
    col.accessor('status', {
      header: 'Trạng thái',
      cell: i => <Badge variant={statusVariant(i.getValue())}>{i.getValue() || 'UNKNOWN'}</Badge>,
    }),
    col.display({
      id: 'actions', 
      header: '',
      cell: i => (
        <button
          title="Xem chi tiết"
          onClick={() => navigate(`/students/${i.row.original.studentCode}`)}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    }),
  ], [navigate]);

  return (
    <div className="space-y-4 max-w-[1400px]">

      {/* Toolbar bộ lọc */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Tìm MSSV, họ tên..."
              className="pl-9 pr-4 py-2 text-sm border border-surface-border rounded-lg w-60 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <select value={faculty} onChange={e => setFaculty(e.target.value)} className={SELECT}>
            <option value="">Tất cả khoa</option>
            {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select value={cohort} onChange={e => setCohort(e.target.value)} className={SELECT}>
            <option value="">Tất cả khóa</option>
            {COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className={SELECT}>
            <option value="">Tất cả trạng thái</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" icon={<Download size={15}/>} onClick={handleExport} disabled={students.length === 0}>
            Export CSV
          </Button>
          <Button size="sm" icon={<Upload size={15}/>} onClick={() => navigate('/import/students')}>
            Import mới
          </Button>
        </div>
      </div>

      {/* Khối hiển thị bảng dữ liệu chính */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-ink-subtle mt-4">Đang tải danh sách sinh viên...</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={students}
              emptyState={
                <EmptyState
                  icon={<Users size={40} className="text-ink-subtle" />}
                  title="Không tìm thấy sinh viên"
                  message="Hệ thống trống hoặc thử thay đổi bộ lọc, từ khóa tìm kiếm"
                />
              }
            />
            {totalElements > 0 && (
              <div className="border-t border-surface-border px-4">
                <Pagination 
                  page={page} 
                  total={totalElements} 
                  pageSize={PAGE_SIZE} 
                  onChange={setPage} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}