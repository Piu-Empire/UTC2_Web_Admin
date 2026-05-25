// src/pages/students/StudentDetailPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/studentApi';
import { ChevronLeft, Mail, Phone, GraduationCap, CalendarDays, User, Users, BookOpen } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { initials, gpaColor, statusVariant, feeVariant, vnd } from '../../utils/formatters';

// ─── Tab definitions ───────────────────────────────────────
const TABS = ['Học kỳ & Điểm', 'Thời khóa biểu', 'Học phí', 'Cảnh báo học vụ'];

// ─── Sub components ────────────────────────────────────────
function InfoRow({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <Icon size={15} className="flex-shrink-0 text-ink-subtle" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function GradeTab({ gradesData }) {
  const semesters = gradesData ? Object.keys(gradesData) : [];
  const [sem, setSem] = useState(semesters[0] || '');

  useEffect(() => {
    if (semesters.length > 0 && !sem) {
      setSem(semesters[0]);
    }
  }, [semesters, sem]);

  const rows = gradesData && sem ? gradesData[sem] : [];

  if (semesters.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={36} className="text-ink-subtle" />}
        title="Chưa có dữ liệu điểm"
        message="Sinh viên này hiện tại chưa có thông tin điểm số trong hệ thống"
      />
    );
  }

  return (
    <div className="space-y-4">
      <select
        value={sem}
        onChange={e => setSem(e.target.value)}
        className="border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {semesters.map(s => <option key={s} value={s}>Học kỳ {s}</option>)}
      </select>

      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted border-b border-surface-border">
              {['Mã HP', 'Tên học phần', 'TC', 'GK', 'CK', 'Điểm', 'Kết quả'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.map(r => (
              <tr key={r.courseCode} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{r.courseCode}</td>
                <td className="px-4 py-3 font-medium text-ink">{r.courseName}</td>
                <td className="px-4 py-3 text-center text-ink-muted">{r.credits}</td>
                <td className="px-4 py-3 text-center">{r.midterm?.toFixed(1) ?? '—'}</td>
                <td className="px-4 py-3 text-center">{r.final?.toFixed(1) ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={gpaColor(r.gpa)}>{r.gpa?.toFixed(1) ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={r.status === 'Đạt' ? 'success' : 'error'}>{r.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScheduleTab({ scheduleData }) {
  if (!scheduleData || scheduleData.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={36} className="text-ink-subtle" />}
        title="Trống lịch học"
        message="Không tìm thấy lịch học của sinh viên trong học kỳ hiện tại"
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-muted border-b border-surface-border">
            {['Mã HP', 'Tên học phần', 'Thứ', 'Tiết', 'Phòng', 'Giảng viên'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {scheduleData.map(r => (
            <tr key={r.courseCode} className="hover:bg-surface-hover transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{r.courseCode}</td>
              <td className="px-4 py-3 font-medium text-ink">{r.courseName}</td>
              <td className="px-4 py-3 text-ink-muted">{r.day}</td>
              <td className="px-4 py-3 text-ink-muted">{r.periods}</td>
              <td className="px-4 py-3">
                <span className="badge badge-info">{r.room}</span>
              </td>
              <td className="px-4 py-3 text-ink-muted">{r.teacher}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PHẦN ĐÃ SỬA LỖI HỌC PHÍ (GIỮ NGUYÊN CẤU TRÚC GỐC) ───
function FeeTab({ feeData }) {
  if (!feeData || feeData.length === 0) {
    return (
      <EmptyState
        icon={<User size={36} className="text-ink-subtle" />}
        title="Không có thông tin học phí"
        message="Hệ thống chưa ghi nhận thông tin học phí của sinh viên này"
      />
    );
  }

  return (
    <div className="space-y-3">
      {feeData.map((f, index) => (
        <div key={index} className="card p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-ink text-sm">Học kỳ {f.semester_id}</p>
            <p className="text-xs text-ink-muted mt-0.5">Hạn đóng: {f.due_date || '—'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">{vnd(f.total_amount)}</p>
            <p className="text-xs text-ink-muted">Đã đóng: {vnd(f.paid_amount)}</p>
          </div>
          <Badge variant={feeVariant(f.status)}>{f.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function WarningTab({ warningData }) {
  if (!warningData || warningData.length === 0) {
    return <p className="text-sm text-ink-muted py-8 text-center">Không có cảnh báo học vụ nào.</p>;
  }

  return (
    <div className="space-y-3">
      {warningData.map((w, i) => (
        <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="badge badge-warning">{w.type}</span>
            <span className="text-xs text-ink-subtle">Học kỳ {w.semester} · {w.createdAt}</span>
          </div>
          <p className="text-sm text-ink leading-relaxed mt-2">{w.message}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────
export default function StudentDetailPage() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.detail(userId);
      let cleanData = res?.data?.data || res?.data || res;
      setProfile(cleanData);
    } catch (err) {
      console.error('Lỗi chi tiết hồ sơ: ', err);
      toast.error('Không tìm thấy thông tin sinh viên');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchStudentProfile();
  }, [userId, fetchStudentProfile]);

  const s = useMemo(() => {
    if (!profile) return null;
    return {
      studentCode: profile.studentCode || profile.studentId || userId,
      fullName: profile.fullName || 'Chưa cập nhật tên',
      status: profile.status || 'ACTIVE',
      email: profile.email || '—',
      phone: profile.phoneNumber || profile.phone || '—',
      faculty: profile.faculty || '—',
      major: profile.major || 'Chưa phân ngành',
      cohort: profile.academicYear || profile.cohort || '—',
      advisor: profile.advisorName || (profile.advisor ? profile.advisor.fullName : 'Chưa phân công'),
      gpa: profile.gpa ?? null,
      grades: profile.grades || null, 
      schedules: profile.schedules || null,
      fees: profile.fees || null,
      warnings: profile.warnings || null
    };
  }, [profile, userId]);

  if (loading) return <div className="space-y-6 max-w-[1200px] animate-pulse bg-surface-muted h-96" />;
  if (!s) return <div className="text-center py-20">Không tồn tại hồ sơ</div>;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />} onClick={() => navigate('/students')}>
        Danh sách sinh viên
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="card p-6 flex flex-col items-center text-center gap-1">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-1">
            <span className="font-display font-bold text-2xl text-brand-700">{initials(s.fullName)}</span>
          </div>
          <h2 className="font-display font-bold text-xl text-ink mt-2">{s.fullName}</h2>
          <p className="font-mono text-sm text-ink-muted">{s.studentCode}</p>
          <div className="mt-2"><Badge variant={statusVariant(s.status)}>{s.status}</Badge></div>
          <div className="mt-3 px-4 py-2 rounded-xl bg-surface-muted w-full">
            <p className="text-xs text-ink-subtle uppercase tracking-wide mb-0.5">GPA tích lũy</p>
            <p className={`font-display font-bold text-2xl ${gpaColor(s.gpa)}`}>
              {s.gpa !== null ? s.gpa.toFixed(2) : '—'}
            </p>
          </div>
          <div className="w-full border-t border-surface-border my-4" />
          <div className="w-full space-y-2.5 text-left">
            <InfoRow icon={Mail} text={s.email} />
            <InfoRow icon={Phone} text={s.phone} />
            <InfoRow icon={GraduationCap} text={`${s.faculty} — ${s.major}`} />
            <InfoRow icon={CalendarDays} text={`Khóa: ${s.cohort}`} />
            <InfoRow icon={User} text={`Cố vấn: ${s.advisor}`} />
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="flex border-b border-surface-border overflow-x-auto">
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)} 
                  className={`px-5 py-3.5 text-sm font-medium ${tab === i ? 'border-b-2 border-brand-600 text-brand-600 font-semibold' : 'text-ink-muted'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="p-5">{[<GradeTab gradesData={s.grades}/>, <ScheduleTab scheduleData={s.schedules}/>, <FeeTab feeData={s.fees}/>, <WarningTab warningData={s.warnings}/>][tab]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}