// src/pages/schedules/ScheduleListPage.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createColumnHelper } from '@tanstack/react-table';
import { Search, CalendarDays, Plus, Upload, Download } from 'lucide-react';
import toast from 'react-hot-toast';

import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { scheduleApi } from '../../api/scheduleApi';
import { semesterApi } from '../../api/semesterApi';

const PAGE_SIZE = 10;
const col = createColumnHelper();
const SELECT =
  'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';

const SCHEDULE_TYPES = [
  { value: 1, label: 'Lịch học' },
  { value: 2, label: 'Lịch thi' },
  { value: 3, label: 'Lịch thi lại' },
];

const SEARCH_OPTIONS = [
  { value: 'sectionCode', label: 'Mã lớp HP' },
  { value: 'courseName', label: 'Môn học' },
  { value: 'dayOfWeek', label: 'Thứ' },
  { value: 'period', label: 'Tiết' },
  { value: 'room', label: 'Phòng' },
  { value: 'lecturerName', label: 'Giảng viên' }
];

export default function ScheduleListPage() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bộ lọc
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('sectionCode');
  const [scheduleType, setScheduleType] = useState('');
  const [semester, setSemester] = useState('');

  const [semesters, setSemesters] = useState([]);

  const [page, setPage] = useState(0);
  const timer = useRef(null);

  function handleSearch(val) {
    setSearch(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setQuery(val);
      setPage(0);
    }, 400);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    setPage(0);
  }, [scheduleType, semester, searchField]);

  // Load semesters
  useEffect(() => {
    semesterApi.getList().then(res => {
      setSemesters(res?.data?.data || []);
    });
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = {
        scheduleType: scheduleType || undefined,
        semesterId: semester || undefined,
        page,
        size: PAGE_SIZE,
      };

      // Gắn query vào đúng trường tìm kiếm được chọn
      if (query) {
        params[searchField] = query;
      }

      const response = await scheduleApi.getList(params);
      const pageData = response?.data?.data || response?.data || response;

      if (pageData?.content) {
        setSchedules(pageData.content);
        setTotalElements(pageData.totalElements || pageData.content.length);
      } else if (Array.isArray(pageData)) {
        setSchedules(pageData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));
        setTotalElements(pageData.length);
      } else {
        setSchedules([]);
        setTotalElements(0);
      }
    } catch {
      setSchedules([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [query, searchField, scheduleType, semester, page]);

  const columns = useMemo(
    () => [
      col.accessor('scheduleType', {
        header: 'Loại lịch',
        cell: i => {
          const t = i.getValue();
          if (t === 1) return <span className="font-medium text-ink">Lịch học</span>;
          if (t === 2) return <Badge variant="warning">LỊCH THI</Badge>;
          if (t === 3) return <Badge variant="error">LỊCH THI LẠI</Badge>;
          return <span>—</span>;
        },
      }),
      col.accessor('sectionCode', {
        header: 'Mã lớp HP',
        cell: i => (
          <span className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 rounded">
            {i.getValue() || '—'}
          </span>
        ),
      }),
      col.accessor('courseName', {
        header: 'Môn học',
        cell: i => <span className="font-medium">{i.getValue() || '—'}</span>,
      }),
      col.accessor('semesterName', {
        header: 'Học kỳ',
        cell: i => <span>{i.getValue() || '—'}</span>,
      }),
      col.accessor('dayOfWeek', {
        header: 'Thứ',
        cell: i => {
          const v = i.getValue();
          return v ? (v === 8 ? 'CN' : `Thứ ${v}`) : '—';
        },
      }),
      col.display({
        id: 'periods',
        header: 'Tiết',
        cell: i => {
          const { startPeriod, endPeriod } = i.row.original;
          if (startPeriod && endPeriod) return <span>{startPeriod}–{endPeriod}</span>;
          return <span>—</span>;
        },
      }),
      col.accessor('room', {
        header: 'Phòng',
        cell: i => (
          <span className="font-mono bg-surface-muted px-1.5 py-0.5 rounded text-xs">
            {i.getValue() || '—'}
          </span>
        ),
      }),
      col.accessor('lecturerName', {
        header: 'Giảng viên',
        cell: i => <span>{i.getValue() || '—'}</span>,
      }),
    ],
    []
  );

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Thời Khóa Biểu theo Lớp</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Tra cứu lịch học / lịch thi theo lớp học phần
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => navigate('/schedules/export')}
            icon={<Download size={15} />}
          >
            Xuất file
          </Button>
          <Button
            variant="outlined"
            size="sm"
            onClick={() => navigate('/schedules/import')}
            icon={<Upload size={15} />}
          >
            Import
          </Button>
          <Button size="sm" onClick={() => navigate('/schedules/create')} icon={<Plus size={15} />}>
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Nhập nội dung tìm kiếm..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={searchField}
            onChange={e => {
              setSearchField(e.target.value);
              setPage(0);
            }}
            className={SELECT}
          >
            {SEARCH_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select value={semester} onChange={e => setSemester(e.target.value)} className={SELECT}>
            <option value="">Tất cả học kỳ</option>
            {semesters.map(s => (
              <option key={s.semesterId} value={s.semesterId}>
                {s.semesterName}
              </option>
            ))}
          </select>

          <select
            value={scheduleType}
            onChange={e => setScheduleType(e.target.value)}
            className={SELECT}
          >
            <option value="">Tất cả loại lịch</option>
            {SCHEDULE_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink-subtle mt-4">Đang tải thời khóa biểu...</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={schedules}
              emptyState={
                <EmptyState
                  icon={<CalendarDays size={40} className="text-ink-subtle" />}
                  title="Chưa có dữ liệu"
                  message="Không tìm thấy lịch phù hợp. Thử thay đổi bộ lọc."
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