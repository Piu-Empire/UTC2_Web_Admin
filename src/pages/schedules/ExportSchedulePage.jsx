// src/pages/schedules/ExportSchedulePage.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import { scheduleApi } from '../../api/scheduleApi';
import client from '../../api/axiosClient';

const INPUT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL = 'block text-sm font-medium text-ink mb-1.5';

function SuggestInput({ label, value, onChange, suggestUrl, placeholder }) {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setResults([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (keyword) => {
    setSearching(true);
    try {
      const res = await client.get(suggestUrl, {
        params: keyword.trim() ? { keyword: keyword.trim() } : {}
      });
      setResults(res?.data?.data || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className={LABEL}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={() => search(value)}
        className={INPUT}
        placeholder={placeholder}
        autoComplete="off"
      />
      {searching && <p className="text-xs text-ink-subtle mt-1">Đang tìm...</p>}
      {results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-surface-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-surface cursor-pointer text-sm text-ink"
              onMouseDown={() => { onChange(r); setResults([]); }}
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ExportSchedulePage() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    scheduleType: '1',
    sectionCode: '',
    courseName: '',
    lecturerId: '',   // gửi lecturer_name lên, server filter theo lecturer_name LIKE
    room: '',
    dayOfWeek: '',
    weekStart: '',
    weekEnd: ''
  });

  const set = (key) => (val) => setFilters(prev => ({ ...prev, [key]: val }));
  const handleChange = (key) => (e) => set(key)(e.target.value);

  const handleExport = async (e) => {
    e.preventDefault();
    setExporting(true);
    try {
      // Chỉ gửi các param khác rỗng/null
      const params = {};
      if (filters.scheduleType) params.scheduleType = filters.scheduleType;
      if (filters.sectionCode) params.sectionCode = filters.sectionCode;
      if (filters.courseName) params.courseName = filters.courseName;
      if (filters.lecturerId) params.lecturerId = filters.lecturerId;
      if (filters.room) params.room = filters.room;
      if (filters.dayOfWeek) params.dayOfWeek = filters.dayOfWeek;
      if (filters.weekStart) params.weekStart = filters.weekStart;
      if (filters.weekEnd) params.weekEnd = filters.weekEnd;

      const response = await scheduleApi.export(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'thoi_khoa_bieu.xls');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất file thành công!');
    } catch {
      toast.error('Lỗi khi tải file. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />} onClick={() => navigate('/schedules')}>
        Quay lại
      </Button>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-ink mb-2">Xuất Thời Khóa Biểu (Excel)</h1>
        <p className="text-sm text-ink-muted mb-6">
          Mặc định sẽ xuất lịch học. Có thể chọn loại lịch khác hoặc thêm bộ lọc trước khi xuất.
        </p>

        <form onSubmit={handleExport} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Loại lịch */}
            <div className="md:col-span-2">
              <label className={LABEL}>Loại lịch</label>
              <select value={filters.scheduleType} onChange={handleChange('scheduleType')} className={INPUT}>
                <option value="1">Lịch học</option>
                <option value="2">Lịch thi</option>
                <option value="3">Lịch thi lại</option>
              </select>
            </div>

            {/* Mã lớp học phần — autocomplete */}
            <SuggestInput
              label="Mã lớp học phần"
              value={filters.sectionCode}
              onChange={set('sectionCode')}
              suggestUrl="/admin/schedules/suggest/sections"
              placeholder="Gõ mã lớp..."
            />

            {/* Tên môn học — autocomplete */}
            <SuggestInput
              label="Tên môn học"
              value={filters.courseName}
              onChange={set('courseName')}
              suggestUrl="/admin/schedules/suggest/courses"
              placeholder="Gõ gần đúng tên môn..."
            />

            {/* Giảng viên — autocomplete */}
            <SuggestInput
              label="Giảng viên"
              value={filters.lecturerId}
              onChange={set('lecturerId')}
              suggestUrl="/admin/schedules/suggest/lecturers"
              placeholder="Gõ tên giảng viên..."
            />

            {/* Phòng — autocomplete */}
            <SuggestInput
              label="Phòng học/thi"
              value={filters.room}
              onChange={set('room')}
              suggestUrl="/admin/schedules/suggest/rooms"
              placeholder="Gõ tên phòng..."
            />

            {/* Thứ */}
            <div>
              <label className={LABEL}>Thứ</label>
              <select value={filters.dayOfWeek} onChange={handleChange('dayOfWeek')} className={INPUT}>
                <option value="">-- Tất cả --</option>
                {[2, 3, 4, 5, 6, 7, 8].map(d => (
                  <option key={d} value={d}>{d === 8 ? 'Chủ nhật' : `Thứ ${d}`}</option>
                ))}
              </select>
            </div>

            {/* spacer */}
            <div />

            {/* Tuần bắt đầu */}
            <div>
              <label className={LABEL}>Tuần bắt đầu</label>
              <input
                type="number"
                value={filters.weekStart}
                onChange={handleChange('weekStart')}
                className={INPUT}
                min="1"
                placeholder="VD: 1"
              />
            </div>

            {/* Tuần kết thúc */}
            <div>
              <label className={LABEL}>Tuần kết thúc</label>
              <input
                type="number"
                value={filters.weekEnd}
                onChange={handleChange('weekEnd')}
                className={INPUT}
                min="1"
                placeholder="VD: 15"
              />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-surface-border">
            <Button type="submit" disabled={exporting} icon={<Download size={16} />}>
              {exporting ? 'Đang chuẩn bị file...' : 'Tải Xuống Excel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}