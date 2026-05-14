// src/pages/students/StudentListPage.jsx (ghi đè placeholder)
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

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK = [
  { id:1,  studentCode:'22IT1001', fullName:'Nguyễn Văn An',    faculty:'Công nghệ TT',   cohort:'2022', gpa:3.52, status:'Đang học'   },
  { id:2,  studentCode:'22IT1002', fullName:'Trần Thị Bình',    faculty:'Công nghệ TT',   cohort:'2022', gpa:2.87, status:'Đang học'   },
  { id:3,  studentCode:'21CE2001', fullName:'Lê Hoàng Cường',   faculty:'Cơ khí',         cohort:'2021', gpa:1.95, status:'Đình chỉ'   },
  { id:4,  studentCode:'22IT1003', fullName:'Phạm Thu Dung',    faculty:'Công nghệ TT',   cohort:'2022', gpa:3.20, status:'Đang học'   },
  { id:5,  studentCode:'20EE3001', fullName:'Đỗ Minh Khoa',     faculty:'Điện - Điện tử', cohort:'2020', gpa:3.75, status:'Tốt nghiệp' },
  { id:6,  studentCode:'23IT1001', fullName:'Nguyễn Thị Lan',   faculty:'Công nghệ TT',   cohort:'2023', gpa:2.40, status:'Đang học'   },
  { id:7,  studentCode:'21CE2002', fullName:'Vũ Đức Mạnh',      faculty:'Cơ khí',         cohort:'2021', gpa:2.65, status:'Bảo lưu'    },
  { id:8,  studentCode:'22EE3001', fullName:'Hoàng Anh Tuấn',   faculty:'Điện - Điện tử', cohort:'2022', gpa:3.10, status:'Đang học'   },
  { id:9,  studentCode:'23IT1002', fullName:'Bùi Thị Ngọc',     faculty:'Công nghệ TT',   cohort:'2023', gpa:3.88, status:'Đang học'   },
  { id:10, studentCode:'20CE2001', fullName:'Trịnh Văn Phúc',   faculty:'Cơ khí',         cohort:'2020', gpa:2.30, status:'Tốt nghiệp' },
  { id:11, studentCode:'22IT1004', fullName:'Đinh Thị Quỳnh',   faculty:'Công nghệ TT',   cohort:'2022', gpa:3.60, status:'Đang học'   },
  { id:12, studentCode:'21EE3002', fullName:'Phan Quốc Toàn',   faculty:'Điện - Điện tử', cohort:'2021', gpa:2.10, status:'Đang học'   },
  { id:13, studentCode:'23CE2001', fullName:'Lý Thị Uyên',      faculty:'Cơ khí',         cohort:'2023', gpa:3.44, status:'Đang học'   },
  { id:14, studentCode:'22IT1005', fullName:'Cao Minh Vũ',      faculty:'Công nghệ TT',   cohort:'2022', gpa:2.78, status:'Đang học'   },
  { id:15, studentCode:'20IT1001', fullName:'Đặng Thị Xuân',    faculty:'Công nghệ TT',   cohort:'2020', gpa:3.95, status:'Tốt nghiệp' },
  { id:16, studentCode:'21IT1002', fullName:'Hà Văn Yên',       faculty:'Công nghệ TT',   cohort:'2021', gpa:1.80, status:'Đình chỉ'   },
  { id:17, studentCode:'23EE3001', fullName:'Kiều Thị Ánh',     faculty:'Điện - Điện tử', cohort:'2023', gpa:3.22, status:'Đang học'   },
  { id:18, studentCode:'22CE2003', fullName:'Mai Trọng Bảo',    faculty:'Cơ khí',         cohort:'2022', gpa:2.55, status:'Đang học'   },
  { id:19, studentCode:'21IT1003', fullName:'Ngô Thị Châu',     faculty:'Công nghệ TT',   cohort:'2021', gpa:3.15, status:'Bảo lưu'    },
  { id:20, studentCode:'20EE3002', fullName:'Ông Văn Dũng',     faculty:'Điện - Điện tử', cohort:'2020', gpa:2.90, status:'Tốt nghiệp' },
  { id:21, studentCode:'23IT1003', fullName:'Quách Thị Em',     faculty:'Công nghệ TT',   cohort:'2023', gpa:3.70, status:'Đang học'   },
  { id:22, studentCode:'22EE3002', fullName:'Rưu Hoàng Phát',   faculty:'Điện - Điện tử', cohort:'2022', gpa:2.45, status:'Đang học'   },
  { id:23, studentCode:'21CE2003', fullName:'Sơn Thị Giang',    faculty:'Cơ khí',         cohort:'2021', gpa:3.33, status:'Đang học'   },
  { id:24, studentCode:'23IT1004', fullName:'Tạ Văn Hùng',      faculty:'Công nghệ TT',   cohort:'2023', gpa:2.99, status:'Đang học'   },
  { id:25, studentCode:'20IT1002', fullName:'Ưng Thị Ích',      faculty:'Công nghệ TT',   cohort:'2020', gpa:3.50, status:'Tốt nghiệp' },
];

const PAGE_SIZE = 10;
const col = createColumnHelper();
const SELECT = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

function AvatarName({ name }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-semibold text-brand-700">{initials(name)}</span>
      </div>
      <span className="font-medium text-sm text-ink">{name}</span>
    </div>
  );
}

export default function StudentListPage() {
  const navigate = useNavigate();

  const [search,  setSearch]  = useState('');
  const [query,   setQuery]   = useState('');
  const [faculty, setFaculty] = useState('');
  const [cohort,  setCohort]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(0);
  const timer = useRef(null);

  // 400ms debounce
  function handleSearch(val) {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setQuery(val); setPage(0); }, 400);
  }
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => setPage(0), [faculty, cohort, status]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK.filter(s => {
      if (q && !s.fullName.toLowerCase().includes(q) && !s.studentCode.toLowerCase().includes(q)) return false;
      if (faculty && s.faculty !== faculty) return false;
      if (cohort  && s.cohort  !== cohort)  return false;
      if (status  && s.status  !== status)  return false;
      return true;
    });
  }, [query, faculty, cohort, status]);

  const pageData  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const faculties = [...new Set(MOCK.map(s => s.faculty))].sort();
  const cohorts   = [...new Set(MOCK.map(s => s.cohort))].sort((a,b) => b - a);

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(filtered.map(s => ({
      'MSSV': s.studentCode, 'Họ và tên': s.fullName,
      'Khoa': s.faculty, 'Khóa': s.cohort,
      'GPA': s.gpa, 'Trạng thái': s.status,
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
    col.accessor('faculty', { header: 'Khoa' }),
    col.accessor('cohort',  { header: 'Khóa' }),
    col.accessor('gpa', {
      header: 'GPA',
      cell: i => {
        const v = i.getValue();
        return <span className={gpaColor(v)}>{v?.toFixed(2) ?? '—'}</span>;
      },
    }),
    col.accessor('status', {
      header: 'Trạng thái',
      cell: i => <Badge variant={statusVariant(i.getValue())}>{i.getValue()}</Badge>,
    }),
    col.display({
      id: 'actions', header: '',
      cell: i => (
        <button
          title="Xem chi tiết"
          onClick={() => navigate(`/students/${i.row.original.id}`)}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-subtle hover:text-ink transition-colors"
        >
          <Eye size={16} />
        </button>
      ),
    }),
  ], [navigate]);

  return (
    <div className="space-y-4 max-w-[1400px]">

      {/* Toolbar */}
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
            {faculties.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={cohort} onChange={e => setCohort(e.target.value)} className={SELECT}>
            <option value="">Tất cả khóa</option>
            {cohorts.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className={SELECT}>
            <option value="">Tất cả trạng thái</option>
            {['Đang học','Bảo lưu','Tốt nghiệp','Đình chỉ'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outlined" size="sm" icon={<Download size={15}/>} onClick={handleExport}>
            Export CSV
          </Button>
          <Button size="sm" icon={<Upload size={15}/>} onClick={() => navigate('/import/students')}>
            Import mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={pageData}
          emptyState={
            <EmptyState
              icon={<Users size={40} className="text-ink-subtle" />}
              title="Không tìm thấy sinh viên"
              message="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
            />
          }
        />
        {filtered.length > 0 && (
          <div className="border-t border-surface-border px-4">
            <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}