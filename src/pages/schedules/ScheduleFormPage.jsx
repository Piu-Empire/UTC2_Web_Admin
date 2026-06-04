// src/pages/schedules/ScheduleFormPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

import Button from '../../components/common/Button';
import { scheduleApi } from '../../api/scheduleApi';
import client from '../../api/axiosClient';

const INPUT = 'w-full border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const LABEL = 'block text-sm font-medium text-ink mb-1.5';

const PERIOD_TIMES = {
  1: { start: '07:00', end: '07:50' },
  2: { start: '07:55', end: '08:45' },
  3: { start: '08:50', end: '09:40' },
  4: { start: '09:50', end: '10:40' },
  5: { start: '10:45', end: '11:35' },
  6: { start: '13:00', end: '13:50' },
  7: { start: '13:55', end: '14:45' },
  8: { start: '14:55', end: '15:45' },
  9: { start: '15:50', end: '16:40' },
  10: { start: '16:45', end: '17:35' },
  11: { start: '18:00', end: '18:50' },
  12: { start: '18:55', end: '19:45' },
  13: { start: '19:55', end: '20:45' },
  14: { start: '20:50', end: '21:40' }
};

const EMPTY_FORM = {
  sectionId: null,      // confirmed ID sau khi chọn từ dropdown
  sectionCode: '',      // text hiển thị trong input
  dayOfWeek: '',
  startPeriod: '',
  endPeriod: '',
  startTime: '',
  endTime: '',
  room: '',
  building: '',
  lecturerName: '',
  weekStart: '',
  weekEnd: '',
  notes: ''
};

export default function ScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduleType, setScheduleType] = useState('1');
  const [formData, setFormData] = useState(EMPTY_FORM);

  // Section autocomplete state
  const [sectionQuery, setSectionQuery] = useState('');
  const [sectionResults, setSectionResults] = useState([]);
  const [sectionSearching, setSectionSearching] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isEdit) fetchDetail();
  }, [id]);

  // Tự động set giờ theo tiết (chỉ lịch học)
  useEffect(() => {
    if (scheduleType !== '1') return;
    const startP = parseInt(formData.startPeriod);
    const endP = parseInt(formData.endPeriod);
    setFormData(prev => ({
      ...prev,
      startTime: PERIOD_TIMES[startP]?.start || prev.startTime,
      endTime: PERIOD_TIMES[endP]?.end || prev.endTime
    }));
  }, [formData.startPeriod, formData.endPeriod, scheduleType]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setSectionResults([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.getDetail(id);
      const d = res?.data?.data || res?.data || res;
      setScheduleType(String(d.scheduleType || 1));
      setSectionQuery(d.sectionCode || '');
      setFormData({
        sectionId: d.sectionId || null,
        sectionCode: d.sectionCode || '',
        dayOfWeek: d.dayOfWeek || '',
        startPeriod: d.startPeriod || '',
        endPeriod: d.endPeriod || '',
        startTime: d.startTime ? d.startTime.slice(0, 5) : '',
        endTime: d.endTime ? d.endTime.slice(0, 5) : '',
        room: d.room || '',
        building: d.building || '',
        lecturerName: d.lecturerName || '',
        weekStart: d.weekStart || '',
        weekEnd: d.weekEnd || '',
        notes: d.notes || ''
      });
    } catch {
      toast.error('Không tải được thông tin lịch');
      navigate('/schedules');
    } finally {
      setLoading(false);
    }
  };

  // Tìm section với debounce 300ms
  const handleSectionInput = (e) => {
    const val = e.target.value;
    setSectionQuery(val);
    // Reset confirmed selection nếu user tự sửa text
    setFormData(prev => ({ ...prev, sectionId: null, sectionCode: '' }));
    setSectionResults([]);

    clearTimeout(debounceRef.current);
    if (!val.trim()) return;

    debounceRef.current = setTimeout(async () => {
      setSectionSearching(true);
      try {
        const res = await client.get('/admin/sections', { params: { keyword: val.trim() } });
        setSectionResults(res?.data?.data || []);
      } catch {
        setSectionResults([]);
      } finally {
        setSectionSearching(false);
      }
    }, 300);
  };

  // User chọn 1 section từ dropdown
  const handleSectionSelect = (section) => {
    setSectionQuery(`${section.sectionCode} — ${section.courseName}`);
    setFormData(prev => ({
      ...prev,
      sectionId: section.sectionId,
      sectionCode: section.sectionCode
    }));
    setSectionResults([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.sectionId) return 'Vui lòng chọn Mã lớp học phần từ danh sách';
    if (!formData.room) return 'Vui lòng nhập Phòng học/thi';

    if (scheduleType === '1') {
      if (!formData.dayOfWeek) return 'Vui lòng chọn Thứ';
      if (!formData.startPeriod || !formData.endPeriod) return 'Vui lòng nhập Tiết bắt đầu và Tiết kết thúc';
      if (parseInt(formData.startPeriod) > parseInt(formData.endPeriod)) return 'Tiết bắt đầu không được lớn hơn Tiết kết thúc';
      if (formData.weekStart && formData.weekEnd && parseInt(formData.weekStart) > parseInt(formData.weekEnd))
        return 'Tuần bắt đầu không được lớn hơn Tuần kết thúc';
    } else {
      if (!formData.startTime) return 'Vui lòng nhập Giờ bắt đầu';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) { toast.error(errorMsg); return; }

    setSaving(true);

    // Gửi sectionId (đã confirmed) — ScheduleRequest không đổi
    const payload = {
      scheduleType: parseInt(scheduleType),
      sectionId: formData.sectionId,
      room: formData.room,
      building: formData.building || undefined,
      lecturerName: formData.lecturerName || undefined,
      notes: formData.notes || undefined,
      ...(scheduleType === '1'
        ? {
          dayOfWeek: parseInt(formData.dayOfWeek),
          startPeriod: parseInt(formData.startPeriod),
          endPeriod: parseInt(formData.endPeriod),
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined,
          weekStart: formData.weekStart ? parseInt(formData.weekStart) : undefined,
          weekEnd: formData.weekEnd ? parseInt(formData.weekEnd) : undefined
        }
        : {
          startTime: formData.startTime || undefined,
          endTime: formData.endTime || undefined
        })
    };

    try {
      if (isEdit) {
        await scheduleApi.update(id, payload);
        toast.success('Cập nhật thành công');
      } else {
        await scheduleApi.create(payload);
        toast.success('Tạo mới thành công');
      }
      navigate('/schedules');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-ink-subtle">Đang tải...</div>;

  const isStudy = scheduleType === '1';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />} onClick={() => navigate('/schedules')}>
        Quay lại
      </Button>

      <div className="card p-6">
        <h1 className="text-xl font-bold text-ink mb-6">
          {isEdit ? 'Chỉnh sửa Thời khóa biểu' : 'Thêm mới Thời khóa biểu'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Loại lịch */}
            <div className="md:col-span-2">
              <label className={LABEL}>Loại lịch</label>
              <select value={scheduleType} onChange={e => setScheduleType(e.target.value)} className={INPUT} disabled={isEdit}>
                <option value="1">Lịch học</option>
                <option value="2">Lịch thi</option>
                <option value="3">Lịch thi lại</option>
              </select>
            </div>

            {/* Mã lớp học phần — autocomplete */}
            <div className="md:col-span-2 relative" ref={dropdownRef}>
              <label className={LABEL}>
                Mã lớp học phần <span className="text-red-500">*</span>
                {formData.sectionId && (
                  <span className="ml-2 text-xs text-green-600 font-normal">✓ Đã xác nhận</span>
                )}
              </label>
              <input
                type="text"
                value={sectionQuery}
                onChange={handleSectionInput}
                className={INPUT}
                placeholder="Gõ mã lớp để tìm, ví dụ: MATH101"
                disabled={isEdit}
                autoComplete="off"
              />
              {sectionSearching && (
                <p className="text-xs text-ink-subtle mt-1">Đang tìm...</p>
              )}
              {sectionResults.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-surface-border rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {sectionResults.map(s => (
                    <li
                      key={s.sectionId}
                      className="px-4 py-2.5 hover:bg-surface cursor-pointer text-sm"
                      onMouseDown={() => handleSectionSelect(s)}
                    >
                      <span className="font-medium text-ink">{s.sectionCode}</span>
                      <span className="text-ink-subtle ml-2">{s.courseName}</span>
                      <span className="text-xs text-ink-subtle ml-2">({s.semesterName})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Giảng viên */}
            <div className="md:col-span-2">
              <label className={LABEL}>Giảng viên</label>
              <input
                type="text"
                name="lecturerName"
                value={formData.lecturerName}
                onChange={handleChange}
                className={INPUT}
                placeholder="Họ tên giảng viên"
              />
            </div>

            {/* Các trường theo loại lịch */}
            {isStudy ? (
              <>
                <div>
                  <label className={LABEL}>Thứ <span className="text-red-500">*</span></label>
                  <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className={INPUT} required>
                    <option value="">-- Chọn thứ --</option>
                    {[2, 3, 4, 5, 6, 7, 8].map(d => (
                      <option key={d} value={d}>{d === 8 ? 'Chủ nhật' : `Thứ ${d}`}</option>
                    ))}
                  </select>
                </div>
                <div />
                <div>
                  <label className={LABEL}>
                    Tiết bắt đầu <span className="text-red-500">*</span>
                    {formData.startTime && <span className="text-brand-600 font-medium ml-2">({formData.startTime})</span>}
                  </label>
                  <input type="number" name="startPeriod" value={formData.startPeriod} onChange={handleChange} className={INPUT} min="1" max="14" required />
                </div>
                <div>
                  <label className={LABEL}>
                    Tiết kết thúc <span className="text-red-500">*</span>
                    {formData.endTime && <span className="text-brand-600 font-medium ml-2">({formData.endTime})</span>}
                  </label>
                  <input type="number" name="endPeriod" value={formData.endPeriod} onChange={handleChange} className={INPUT} min="1" max="14" required />
                </div>
                <div>
                  <label className={LABEL}>Tuần bắt đầu</label>
                  <input type="number" name="weekStart" value={formData.weekStart} onChange={handleChange} className={INPUT} min="1" />
                </div>
                <div>
                  <label className={LABEL}>Tuần kết thúc</label>
                  <input type="number" name="weekEnd" value={formData.weekEnd} onChange={handleChange} className={INPUT} min="1" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={LABEL}>Giờ bắt đầu <span className="text-red-500">*</span></label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={INPUT} required />
                </div>
                <div>
                  <label className={LABEL}>Giờ kết thúc</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={INPUT} />
                </div>
              </>
            )}

            {/* Phòng & Tòa nhà */}
            <div>
              <label className={LABEL}>Phòng học/thi <span className="text-red-500">*</span></label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} className={INPUT} placeholder="Ví dụ: 101" required />
            </div>
            <div>
              <label className={LABEL}>Tòa nhà</label>
              <input type="text" name="building" value={formData.building} onChange={handleChange} className={INPUT} placeholder="Ví dụ: A1" />
            </div>

            {/* Ghi chú */}
            <div className="md:col-span-2">
              <label className={LABEL}>Ghi chú</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} className={`${INPUT} h-24 resize-none`} placeholder="Ghi chú thêm..." />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-surface-border">
            <Button type="submit" disabled={saving} icon={<Save size={16} />}>
              {saving ? 'Đang lưu...' : 'Lưu lại'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}