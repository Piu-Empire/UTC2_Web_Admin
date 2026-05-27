// src/pages/students/StudentDetailPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { studentApi } from '../../api/studentApi';
import { ChevronLeft, Mail, Phone, GraduationCap, CalendarDays, User, BookOpen, MapPin } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { initials, gpaColor, statusVariant, feeVariant, vnd } from '../../utils/formatters';

// ─── Tab definitions ───────────────────────────────────────
const TABS = ['Học kỳ & Điểm', 'Thời khóa biểu', 'Học phí', 'Cảnh báo học vụ'];

// ─── Sub components ────────────────────────────────────────
function InfoRow({ icon: Icon, text }) {
  if (!text || text === '—') return null;
  return (
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <Icon size={15} className="flex-shrink-0 text-ink-subtle" />
      <span className="truncate">{text}</span>
    </div>
  );
}

function GradeTab({ gradesData }) {
  // Backend trả Map<semesterId, List<enrollment+course>>
  // Hỗ trợ cả mảng phẳng lẫn object phân kỳ
  const formattedGrades = useMemo(() => {
    if (!gradesData) return {};
    if (Array.isArray(gradesData)) {
      return gradesData.reduce((acc, curr) => {
        const key = curr.semester_id || curr.semesterId || 'allGrades';
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
      }, {});
    }
    return gradesData;
  }, [gradesData]);

  const semesters = Object.keys(formattedGrades);
  const [sem, setSem] = useState('');

  useEffect(() => {
    if (semesters.length > 0) setSem(semesters[0]);
  }, [semesters.join(',')]);

  const rows = formattedGrades[sem] || [];

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
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-ink-muted uppercase">Chọn học kỳ:</label>
        <select
          value={sem}
          onChange={e => setSem(e.target.value)}
          className="border border-surface-border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {semesters.map(s => (
            <option key={s} value={s}>
              {s === 'allGrades' ? 'Tất cả học kỳ' : `Học kỳ ${s}`}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-surface-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted border-b border-surface-border">
              {['Mã HP', 'Tên học phần', 'TC', 'GK', 'CK', 'Điểm TK', 'Xếp loại', 'Kết quả'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.map((r, index) => {
              // Backend giờ JOIN course → dùng trực tiếp các field đã JOIN
              const code    = r.courseCode    || r.course_code    || '—';
              const name    = r.courseName    || r.course_name    || '—';
              const credits = r.credits       || 0;
              const mid     = r.midterm_score ?? r.midtermScore   ?? null;
              const fin     = r.final_score   ?? r.finalScore     ?? null;
              const total   = r.total_score   ?? r.totalScore     ?? null;
              const letter  = r.letter_grade  || r.letterGrade    || '—';
              const passed  = r.is_passed     ?? r.isPassed       ?? false;

              return (
                <tr key={`${code}-${index}`} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{code}</td>
                  <td className="px-4 py-3 font-medium text-ink">{name}</td>
                  <td className="px-4 py-3 text-center text-ink-muted">{credits}</td>
                  <td className="px-4 py-3 text-center">
                    {mid !== null ? Number(mid).toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {fin !== null ? Number(fin).toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {total !== null ? (
                      <span className={gpaColor(total)}>{Number(total).toFixed(1)}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{letter}</td>
                  <td className="px-4 py-3">
                    <Badge variant={passed ? 'success' : 'error'}>
                      {passed ? 'Đạt' : 'Không đạt'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
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

  const DAY_LABELS = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-muted border-b border-surface-border">
            {['Mã HP', 'Tên học phần', 'Thứ', 'Tiết', 'Phòng', 'Tòa nhà', 'Giảng viên'].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-ink-muted uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-border">
          {scheduleData.map((r, index) => {
            // Backend JOIN course → dùng trực tiếp
            const code    = r.courseCode   || r.course_code   || '—';
            const name    = r.courseName   || r.course_name   || '—';
            const dow     = r.day_of_week  || r.dayOfWeek     || 0;
            const dayLabel = DAY_LABELS[dow] || `Thứ ${dow}`;
            const startP  = r.start_period || r.startPeriod  || '?';
            const endP    = r.end_period   || r.endPeriod     || '?';
            const room    = r.room         || '—';
            const building = r.building    || '—';
            const teacher = r.lecturer_name || r.lecturerName || '—';

            return (
              <tr key={`${code}-${index}`} className="hover:bg-surface-hover transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-ink-subtle">{code}</td>
                <td className="px-4 py-3 font-medium text-ink">{name}</td>
                <td className="px-4 py-3 text-ink-muted">{dayLabel}</td>
                <td className="px-4 py-3 text-ink-muted">{startP}–{endP}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {room}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">{building}</td>
                <td className="px-4 py-3 text-ink-muted">{teacher}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FeeTab({ feeData }) {
  if (!feeData || feeData.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={36} className="text-ink-subtle" />}
        title="Không có thông tin học phí"
        message="Hệ thống chưa ghi nhận thông tin học phí của sinh viên này"
      />
    );
  }

  return (
    <div className="space-y-3">
      {feeData.map((f, index) => {
        const semName     = f.semesterName  || f.semester_name || `Học kỳ ${f.semester_id || f.semesterId || '—'}`;
        const dueDate     = f.due_date      || f.dueDate       || '—';
        const totalAmount = f.total_amount  || f.totalAmount   || 0;
        const paidAmount  = f.paid_amount   || f.paidAmount    || 0;
        const feeType     = f.fee_type      || f.feeType       || '';
        const status      = f.status        || 'chưa đóng';

        return (
          <div key={f.fee_id || f.id || index} className="card p-4 flex items-center gap-4 border border-surface-border rounded-xl bg-white shadow-sm">
            <div className="flex-1">
              <p className="font-medium text-ink text-sm">{semName}</p>
              {feeType && <p className="text-xs text-ink-subtle mt-0.5">{feeType === 'SUBJECT' ? 'Học phí môn học' : feeType === 'DORMITORY' ? 'Ký túc xá' : feeType}</p>}
              <p className="text-xs text-ink-muted mt-0.5">Hạn đóng: {dueDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-ink">{vnd(totalAmount)}</p>
              <p className="text-xs text-ink-muted">Đã đóng: {vnd(paidAmount)}</p>
            </div>
            <Badge variant={feeVariant(status)}>{status}</Badge>
          </div>
        );
      })}
    </div>
  );
}

function WarningTab({ warningData }) {
  if (!warningData || warningData.length === 0) {
    return <p className="text-sm text-green-600 py-8 text-center font-medium">✓ Không có cảnh báo học vụ nào.</p>;
  }

  const WARNING_LABELS = {
    LOW_GPA:      'GPA thấp',
    FAILED_EXAM:  'Điểm thi không đạt',
    ATTENDANCE:   'Vắng mặt quá mức',
  };

  const STATUS_VARIANT = {
    ACTIVE:   'error',
    RESOLVED: 'success',
  };

  return (
    <div className="space-y-3">
      {warningData.map((w, i) => {
        const type       = WARNING_LABELS[w.warning_type] || w.warning_type || 'Cảnh báo';
        const semName    = w.semesterName || w.semester_name || `Học kỳ ${w.semester_id || '—'}`;
        const issuedAt   = w.issued_at    ? new Date(w.issued_at).toLocaleDateString('vi-VN') : '—';
        const desc       = w.description  || '—';
        const wStatus    = w.status       || 'ACTIVE';

        return (
          <div key={w.warning_id || w.id || i} className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  {type}
                </span>
                <Badge variant={STATUS_VARIANT[wStatus] || 'warning'}>
                  {wStatus === 'ACTIVE' ? 'Đang hiệu lực' : wStatus === 'RESOLVED' ? 'Đã giải quyết' : wStatus}
                </Badge>
              </div>
              <span className="text-xs text-ink-subtle">{semName} · {issuedAt}</span>
            </div>
            <p className="text-sm text-amber-900 leading-relaxed font-medium">{desc}</p>
          </div>
        );
      })}
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
      studentCode:  profile.studentId    || profile.studentCode || userId,
      fullName:     profile.fullName      || 'Chưa cập nhật tên',
      status:       profile.status        || 'đang học',
      email:        profile.email         || '—',
      phone:        profile.phoneNumber   || profile.phone || '—',
      address:      profile.address       || null,
      dateOfBirth:  profile.dateOfBirth   ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : null,
      gender:       profile.gender        || null,
      avatarUrl:    profile.avatarUrl     || null,
      faculty:      profile.faculty       || '—',
      major:        profile.major         || 'Chưa phân ngành',
      cohort:       profile.academicYear  || profile.cohort || '—',
      className:    profile.className     || null,
      advisor:      profile.advisorName   || 'Chưa phân công',
      gpa:          profile.gpa           ?? null,
      grades:       profile.grades        || null,
      schedules:    profile.schedules     || null,
      fees:         profile.fees          || null,
      warnings:     profile.warnings      || null,
    };
  }, [profile, userId]);

  if (loading) return <div className="space-y-6 max-w-[1200px] animate-pulse bg-surface-muted h-96 rounded-xl" />;
  if (!s) return <div className="text-center py-20 font-medium text-ink-muted">Không tồn tại hồ sơ sinh viên này</div>;

  return (
    <div className="space-y-6 max-w-[1200px]">
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />} onClick={() => navigate('/students')}>
        Danh sách sinh viên
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Cột Trái: Hồ sơ cá nhân */}
        <div className="bg-white border border-surface-border rounded-xl shadow-sm p-6 flex flex-col items-center text-center gap-1">
          {s.avatarUrl ? (
            <img src={s.avatarUrl} alt={s.fullName} className="w-20 h-20 rounded-full object-cover mb-1" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-1">
              <span className="font-display font-bold text-2xl text-brand-700">{initials(s.fullName)}</span>
            </div>
          )}
          <h2 className="font-display font-bold text-xl text-ink mt-2">{s.fullName}</h2>
          <p className="font-mono text-sm text-ink-muted">{s.studentCode}</p>
          {s.className && <p className="text-xs text-ink-subtle">{s.className}</p>}
          <div className="mt-2"><Badge variant={statusVariant(s.status)}>{s.status}</Badge></div>

          <div className="mt-3 px-4 py-2 rounded-xl bg-surface-muted w-full">
            <p className="text-xs text-ink-subtle uppercase tracking-wide mb-0.5">GPA tích lũy</p>
            <p className={`font-display font-bold text-2xl ${gpaColor(s.gpa)}`}>
              {s.gpa !== null ? Number(s.gpa).toFixed(2) : '—'}
            </p>
          </div>

          <div className="w-full border-t border-surface-border my-4" />
          <div className="w-full space-y-2.5 text-left">
            <InfoRow icon={Mail}          text={s.email} />
            <InfoRow icon={Phone}         text={s.phone} />
            <InfoRow icon={GraduationCap} text={`${s.faculty} — ${s.major}`} />
            <InfoRow icon={CalendarDays}  text={`Khóa: ${s.cohort}`} />
            <InfoRow icon={User}          text={`Cố vấn: ${s.advisor}`} />
            {s.dateOfBirth && <InfoRow icon={CalendarDays} text={`Sinh: ${s.dateOfBirth}${s.gender ? ` · ${s.gender}` : ''}`} />}
            {s.address     && <InfoRow icon={MapPin}       text={s.address} />}
          </div>
        </div>

        {/* Cột Phải: Danh sách Tab nội dung */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-surface-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b border-surface-border overflow-x-auto bg-surface-muted">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
                    tab === i
                      ? 'border-b-2 border-brand-600 text-brand-600 font-semibold bg-white'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-hover'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="p-5">
              {[
                <GradeTab    key="grade"    gradesData={s.grades}   />,
                <ScheduleTab key="schedule" scheduleData={s.schedules} />,
                <FeeTab      key="fee"      feeData={s.fees}        />,
                <WarningTab  key="warning"  warningData={s.warnings} />,
              ][tab]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}