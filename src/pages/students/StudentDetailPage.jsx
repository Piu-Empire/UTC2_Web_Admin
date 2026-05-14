// src/pages/students/StudentDetailPage.jsx (ghi đè placeholder)
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, GraduationCap, CalendarDays, User } from 'lucide-react';
import Badge  from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { initials, gpaColor, statusVariant, feeVariant, vnd } from '../../utils/formatters';

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_DETAIL = {
  id: 1, studentCode: '22IT1001', fullName: 'Nguyễn Văn An',
  status: 'Đang học', email: 'an.nv@student.utc2.edu.vn', phone: '0901 234 567',
  faculty: 'Công nghệ Thông tin', major: 'Kỹ thuật phần mềm',
  cohort: '2022', advisor: 'TS. Nguyễn Thị Bình', gpa: 3.52,
};

const MOCK_GRADES = {
  '2024-1': [
    { courseCode: 'IT3010', courseName: 'Lập trình Web',         credits: 3, midterm: 7.5, final: 8.5, gpa: 8.2, status: 'Đạt'     },
    { courseCode: 'IT3020', courseName: 'Cơ sở dữ liệu',         credits: 4, midterm: 6.0, final: 7.0, gpa: 6.7, status: 'Đạt'     },
    { courseCode: 'IT3030', courseName: 'Mạng máy tính',         credits: 3, midterm: 8.0, final: 9.0, gpa: 8.7, status: 'Đạt'     },
    { courseCode: 'MA2010', courseName: 'Xác suất thống kê',     credits: 3, midterm: 5.0, final: 5.5, gpa: 5.3, status: 'Đạt'     },
    { courseCode: 'IT3040', courseName: 'Kỹ nghệ phần mềm',      credits: 4, midterm: 4.0, final: 4.5, gpa: 4.3, status: 'Không đạt'},
  ],
  '2023-2': [
    { courseCode: 'IT2010', courseName: 'Cấu trúc dữ liệu',      credits: 4, midterm: 7.0, final: 8.0, gpa: 7.7, status: 'Đạt'     },
    { courseCode: 'IT2020', courseName: 'Lập trình hướng đối tượng',credits:3,midterm:8.5, final: 9.0, gpa: 8.8, status: 'Đạt'     },
    { courseCode: 'MA1020', courseName: 'Đại số tuyến tính',     credits: 3, midterm: 6.5, final: 7.5, gpa: 7.2, status: 'Đạt'     },
  ],
};

const MOCK_SCHEDULE = [
  { courseCode: 'IT3010', courseName: 'Lập trình Web',      day: 'Thứ 2', periods: '1–3',  room: 'A201', teacher: 'TS. Lê Văn C' },
  { courseCode: 'IT3020', courseName: 'Cơ sở dữ liệu',     day: 'Thứ 3', periods: '4–6',  room: 'B305', teacher: 'ThS. Trần Thị D' },
  { courseCode: 'IT3030', courseName: 'Mạng máy tính',      day: 'Thứ 4', periods: '7–9',  room: 'C102', teacher: 'TS. Phạm Văn E' },
  { courseCode: 'MA2010', courseName: 'Xác suất thống kê',  day: 'Thứ 5', periods: '1–3',  room: 'A105', teacher: 'PGS. Hoàng Thị F'},
  { courseCode: 'IT3040', courseName: 'Kỹ nghệ phần mềm',   day: 'Thứ 6', periods: '4–7',  room: 'B201', teacher: 'TS. Đỗ Văn G' },
];

const MOCK_FEES = [
  { semester: '2024-1', total: 9_800_000, paid: 9_800_000, due: '2024-09-15', status: 'Đã đóng'    },
  { semester: '2023-2', total: 9_200_000, paid: 5_000_000, due: '2024-03-10', status: 'Đóng 1 phần'},
  { semester: '2023-1', total: 9_200_000, paid: 9_200_000, due: '2023-09-15', status: 'Đã đóng'    },
  { semester: '2022-2', total: 8_800_000, paid: 0,         due: '2023-03-01', status: 'Chưa đóng'  },
];

const MOCK_WARNINGS = [
  { semester: '2024-1', type: 'Học vụ', message: 'Điểm môn IT3040 (Kỹ nghệ phần mềm) không đạt — cần đăng ký học lại', createdAt: '2024-12-20' },
  { semester: '2023-2', type: 'Học phí', message: 'Còn nợ 4.200.000 ₫ học phí kỳ 2023-2. Vui lòng đóng trước 01/06/2024', createdAt: '2024-04-01' },
];

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

function GradeTab() {
  const semesters = Object.keys(MOCK_GRADES);
  const [sem, setSem] = useState(semesters[0]);
  const rows = MOCK_GRADES[sem] ?? [];

  return (
    <div className="space-y-4">
      <select
        value={sem}
        onChange={e => setSem(e.target.value)}
        className="border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {semesters.map(s => <option key={s}>Học kỳ {s}</option>)}
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
                <td className="px-4 py-3 text-center">{r.midterm?.toFixed(1)}</td>
                <td className="px-4 py-3 text-center">{r.final?.toFixed(1)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={gpaColor(r.gpa)}>{r.gpa?.toFixed(1)}</span>
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

function ScheduleTab() {
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
          {MOCK_SCHEDULE.map(r => (
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

function FeeTab() {
  return (
    <div className="space-y-3">
      {MOCK_FEES.map(f => (
        <div key={f.semester} className="card p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="font-medium text-ink text-sm">Học kỳ {f.semester}</p>
            <p className="text-xs text-ink-muted mt-0.5">Hạn đóng: {f.due}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">{vnd(f.total)}</p>
            <p className="text-xs text-ink-muted">Đã đóng: {vnd(f.paid)}</p>
          </div>
          <Badge variant={feeVariant(f.status)}>{f.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function WarningTab() {
  if (MOCK_WARNINGS.length === 0)
    return <p className="text-sm text-ink-muted py-8 text-center">Không có cảnh báo nào.</p>;

  return (
    <div className="space-y-3">
      {MOCK_WARNINGS.map((w, i) => (
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

// ─── Page ──────────────────────────────────────────────────
export default function StudentDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [tab, setTab] = useState(0);

  // In real app: fetch by id. Using mock for now.
  const s = { ...MOCK_DETAIL, id: Number(id) };

  const TAB_CONTENT = [<GradeTab />, <ScheduleTab />, <FeeTab />, <WarningTab />];

  return (
    <div className="space-y-6 max-w-[1200px]">

      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        icon={<ChevronLeft size={15} />}
        onClick={() => navigate('/students')}
      >
        Danh sách sinh viên
      </Button>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6 items-start">

        {/* ── Profile card (col-span-1) ── */}
        <div className="card p-6 flex flex-col items-center text-center gap-1">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mb-1">
            <span className="font-display font-bold text-2xl text-brand-700">
              {initials(s.fullName)}
            </span>
          </div>

          <h2 className="font-display font-bold text-xl text-ink mt-2">{s.fullName}</h2>
          <p className="font-mono text-sm text-ink-muted">{s.studentCode}</p>
          <div className="mt-2">
            <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
          </div>

          {/* GPA pill */}
          <div className="mt-3 px-4 py-2 rounded-xl bg-surface-muted w-full">
            <p className="text-xs text-ink-subtle uppercase tracking-wide mb-0.5">GPA tích lũy</p>
            <p className={`font-display font-bold text-2xl ${gpaColor(s.gpa)}`}>
              {s.gpa?.toFixed(2)}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-surface-border my-4" />

          {/* Info rows */}
          <div className="w-full space-y-2.5 text-left">
            <InfoRow icon={Mail}          text={s.email} />
            <InfoRow icon={Phone}         text={s.phone} />
            <InfoRow icon={GraduationCap} text={`${s.faculty} — ${s.major}`} />
            <InfoRow icon={CalendarDays}  text={`Khóa ${s.cohort}`} />
            <InfoRow icon={User}          text={`Cố vấn: ${s.advisor}`} />
          </div>
        </div>

        {/* ── Tab panel (col-span-2) ── */}
        <div className="col-span-2 space-y-4">
          {/* Tab bar */}
          <div className="card overflow-hidden">
            <div className="flex border-b border-surface-border">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`
                    px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap
                    ${tab === i
                      ? 'border-b-2 border-brand-600 text-brand-600 font-semibold -mb-px'
                      : 'text-ink-muted hover:text-ink'}
                  `}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {TAB_CONTENT[tab]}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}