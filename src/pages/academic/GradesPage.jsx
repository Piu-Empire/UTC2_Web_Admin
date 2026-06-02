// src/pages/academic/GradesPage.jsx
// Giảng viên (STAFF lv2): chọn môn → chọn lớp → xem + nhập điểm cả lớp
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Pencil, Check, X, Upload, Download, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import Badge      from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { academicApi } from '../../api/academicApi';
import { gpaColor } from '../../utils/formatters';

const INPUT  = 'border border-surface-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500';
const SELECT = `${INPUT} cursor-pointer`;

function gradeVariant(letter) {
  if (!letter) return 'neutral';
  if (['A+','A'].includes(letter))  return 'success';
  if (['B+','B'].includes(letter))  return 'info';
  if (['C+','C'].includes(letter))  return 'warning';
  return 'error';
}

// ── Inline edit row ────────────────────────────────────────────────────────
function GradeRow({ grade, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    midtermScore:    grade.midtermScore    ?? '',
    finalScore:      grade.finalScore      ?? '',
    assignmentScore: grade.assignmentScore ?? '',
  });
  const [cur, setCur] = useState(grade);

  function handleEdit() {
    setForm({ midtermScore: cur.midtermScore ?? '', finalScore: cur.finalScore ?? '', assignmentScore: cur.assignmentScore ?? '' });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        midtermScore:    form.midtermScore    !== '' ? Number(form.midtermScore)    : null,
        finalScore:      form.finalScore      !== '' ? Number(form.finalScore)      : null,
        assignmentScore: form.assignmentScore !== '' ? Number(form.assignmentScore) : null,
      };
      const res = await academicApi.updateGrade(cur.enrollmentId, payload);
      const updated = res.data?.data ?? cur;
      setCur(updated);
      onSaved(updated);
      setEditing(false);
    } catch (e) {
      alert('Lưu điểm thất bại: ' + (e?.response?.data?.message ?? e.message));
    } finally { setSaving(false); }
  }

  const ScoreInput = ({ field, placeholder }) => (
    <input type="number" min="0" max="10" step="0.1" value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      placeholder={placeholder}
      className="w-16 border border-brand-300 rounded px-1.5 py-0.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand-500"/>
  );

  return (
    <tr className={`transition-colors ${editing ? 'bg-brand-50' : 'hover:bg-slate-50'}`}>
      <td className="px-3 py-2.5 font-mono text-xs text-ink-subtle">{cur.studentCode}</td>
      <td className="px-3 py-2.5 font-medium text-ink">{cur.fullName}</td>
      <td className="px-3 py-2.5 text-xs text-ink-subtle">{cur.className}</td>
      <td className="px-3 py-2.5 text-center">{editing ? <ScoreInput field="midtermScore" placeholder="GK"/> : (cur.midtermScore ?? '—')}</td>
      <td className="px-3 py-2.5 text-center">{editing ? <ScoreInput field="finalScore" placeholder="CK"/> : (cur.finalScore ?? '—')}</td>
      <td className="px-3 py-2.5 text-center">{editing ? <ScoreInput field="assignmentScore" placeholder="BT"/> : (cur.assignmentScore ?? '—')}</td>
      <td className={`px-3 py-2.5 text-center font-semibold ${gpaColor(cur.totalScore ? cur.totalScore / 2.5 : 0)}`}>{cur.totalScore ?? '—'}</td>
      <td className="px-3 py-2.5">
        {cur.letterGrade ? <Badge variant={gradeVariant(cur.letterGrade)}>{cur.letterGrade}</Badge> : <span className="text-ink-subtle">—</span>}
      </td>
      <td className="px-3 py-2.5">
        <Badge variant={cur.isPassed === true ? 'success' : cur.isPassed === false ? 'error' : 'neutral'}>
          {cur.isPassed === true ? 'Đạt' : cur.isPassed === false ? 'Trượt' : 'Học'}
        </Badge>
      </td>
      <td className="px-3 py-2.5">
        {editing ? (
          <div className="flex gap-1">
            <button onClick={handleSave} disabled={saving}
              className="p-1.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors">
              {saving ? <span className="w-3 h-3 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin inline-block"/> : <Check size={13}/>}
            </button>
            <button onClick={() => setEditing(false)} disabled={saving}
              className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              <X size={13}/>
            </button>
          </div>
        ) : (
          <button onClick={handleEdit} className="p-1.5 rounded text-ink-subtle hover:text-brand-600 hover:bg-brand-50 transition-colors">
            <Pencil size={13}/>
          </button>
        )}
      </td>
    </tr>
  );
}

// ── Import Excel modal ─────────────────────────────────────────────────────
function ImportModal({ onClose, onImported }) {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult]     = useState(null);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = ev => {
      const wb = XLSX.read(ev.target.result, { type: 'binary' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsBinaryString(f);
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      const wb   = XLSX.read(ev.target.result, { type: 'binary' });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      let ok = 0, fail = 0;
      for (const row of rows) {
        try {
          const id = row['enrollmentId'] ?? row['enrollment_id'];
          if (!id) { fail++; continue; }
          await academicApi.updateGrade(Number(id), {
            midtermScore:    row['midtermScore']    ?? row['Giữa kỳ']  ?? null,
            finalScore:      row['finalScore']      ?? row['Cuối kỳ']  ?? null,
            assignmentScore: row['assignmentScore'] ?? row['BT']       ?? null,
          });
          ok++;
        } catch { fail++; }
      }
      setResult({ ok, fail });
      setImporting(false);
      if (ok > 0) onImported();
    };
    reader.readAsBinaryString(file);
  }

  function downloadTemplate() {
    const ws = XLSX.utils.json_to_sheet([
      { enrollmentId: 1, midtermScore: 8.0, finalScore: 8.5, assignmentScore: 9.0 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm');
    XLSX.writeFile(wb, 'template-nhap-diem.xlsx');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-[520px] max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-ink">Import điểm từ Excel</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-hover text-ink-subtle"><X size={16}/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-slate-50 border border-surface-border p-4">
            <p className="text-sm font-medium text-ink mb-1">Định dạng file</p>
            <p className="text-xs text-ink-subtle mb-2">Cột bắt buộc: <code className="bg-white px-1 rounded border">enrollmentId</code> — lấy từ Export danh sách lớp</p>
            <button onClick={downloadTemplate} className="text-xs text-brand-600 hover:underline font-medium">Tải file mẫu</button>
          </div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-surface-border rounded-lg p-6 cursor-pointer hover:border-brand-400 transition-colors">
            <Upload size={24} className="text-ink-subtle mb-2"/>
            <span className="text-sm text-ink-subtle">{file ? file.name : 'Chọn file Excel (.xlsx)'}</span>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile}/>
          </label>
          {preview.length > 0 && (
            <div className="overflow-x-auto">
              <p className="text-xs text-ink-subtle mb-1">Xem trước (5 dòng):</p>
              <table className="w-full text-xs border border-surface-border rounded">
                <thead className="bg-slate-50"><tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-2 py-1.5 text-left font-medium border-b border-surface-border">{k}</th>)}</tr></thead>
                <tbody>{preview.map((row, i) => <tr key={i} className="border-b last:border-0">{Object.values(row).map((v, j) => <td key={j} className="px-2 py-1.5">{String(v)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {result && (
            <div className={`rounded-lg p-3 text-sm ${result.fail === 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
              ✓ Thành công: {result.ok} {result.fail > 0 && `· ✗ Lỗi: ${result.fail}`}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-surface-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-surface-border rounded-lg hover:bg-surface-hover transition-colors">{result ? 'Đóng' : 'Huỷ'}</button>
          {!result && <button onClick={handleImport} disabled={!file || importing}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 font-medium transition-colors">
            {importing ? 'Đang import...' : 'Import'}
          </button>}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function GradesPage() {
  const navigate = useNavigate();

  const [courseId,   setCourseId]   = useState('');
  const [className,  setClassName]  = useState('');
  const [courses,    setCourses]    = useState([]);
  const [classes,    setClasses]    = useState([]);
  const [grades,     setGrades]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Lấy danh sách môn học từ server (dùng enrollment API hiện có)
  useEffect(() => {
    // Courses: cần 1 endpoint lấy danh sách môn — dùng bảng course
    // Tạm thời để trống, giảng viên nhập courseId thủ công
  }, []);

  async function handleSearch() {
    if (!courseId) return;
    setLoading(true); setSearched(true);
    try {
      const res = await academicApi.getGradesByCourse(Number(courseId), className || undefined);
      const data = res.data?.data ?? [];
      setGrades(data);
      // Lấy danh sách lớp duy nhất từ kết quả
      const cls = [...new Set(data.map(g => g.className).filter(Boolean))];
      setClasses(cls);
    } catch (e) {
      alert('Lỗi: ' + (e?.response?.data?.message ?? e.message));
      setGrades([]);
    } finally { setLoading(false); }
  }

  function handleSaved(updated) {
    setGrades(prev => prev.map(g => g.enrollmentId === updated.enrollmentId
      ? { ...g, ...updated } : g));
  }

  function handleExport() {
    const ws = XLSX.utils.json_to_sheet(grades.map(g => ({
      enrollmentId: g.enrollmentId, MSSV: g.studentCode, 'Họ tên': g.fullName, Lớp: g.className,
      'Giữa kỳ': g.midtermScore, 'Cuối kỳ': g.finalScore, BT: g.assignmentScore,
      'Tổng': g.totalScore, 'Xếp loại': g.letterGrade, 'GPA': g.gradePoint,
      'Đạt': g.isPassed ? 'Đạt' : 'Không đạt',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm');
    XLSX.writeFile(wb, `diem-mon-${courseId}-${className || 'tatca'}.xlsx`);
  }

  const passed   = grades.filter(g => g.isPassed === true).length;
  const failed   = grades.filter(g => g.isPassed === false).length;

  return (
    <div className="space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-surface-hover text-ink-subtle"><ArrowLeft size={18}/></button>
        <div>
          <h1 className="font-display font-bold text-xl text-ink">Nhập điểm theo môn</h1>
          <p className="text-sm text-ink-subtle">Giảng viên chọn môn học và lớp để nhập điểm</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-subtle whitespace-nowrap">Mã môn (courseId):</label>
          <input value={courseId} onChange={e => setCourseId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="VD: 1" className={`${INPUT} w-28`}/>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-ink-subtle">Lớp:</label>
          {classes.length > 0 ? (
            <select value={className} onChange={e => { setClassName(e.target.value); }}
              className={`${SELECT} w-36`}>
              <option value="">Tất cả lớp</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input value={className} onChange={e => setClassName(e.target.value)}
              placeholder="VD: 65TH3" className={`${INPUT} w-36`}/>
          )}
        </div>
        <button onClick={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700 font-medium transition-colors">
          <Search size={15}/> Tìm
        </button>
        {grades.length > 0 && (
          <>
            <button onClick={() => setShowImport(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium transition-colors ml-auto">
              <Upload size={15}/> Import Excel
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-surface-border rounded-lg hover:bg-surface-hover transition-colors">
              <Download size={15}/> Export
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      {grades.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4"><p className="text-xs text-ink-subtle">Tổng sinh viên</p><p className="text-2xl font-bold text-ink mt-1">{grades.length}</p></div>
          <div className="card p-4"><p className="text-xs text-ink-subtle">Đạt</p><p className="text-2xl font-bold text-emerald-600 mt-1">{passed}</p></div>
          <div className="card p-4"><p className="text-xs text-ink-subtle">Không đạt / Chưa có điểm</p><p className="text-2xl font-bold text-rose-500 mt-1">{failed} / {grades.length - passed - failed}</p></div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : searched && grades.length === 0 ? (
          <EmptyState icon={<ClipboardList size={40} className="text-ink-subtle"/>}
            title="Không có dữ liệu" message="Không tìm thấy sinh viên cho môn và lớp này"/>
        ) : grades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-subtle text-xs uppercase tracking-wide">
                <tr>
                  {['MSSV','Họ tên','Lớp','Giữa kỳ','Cuối kỳ','BT','Tổng','Loại','Đạt',''].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {grades.map(g => <GradeRow key={g.enrollmentId} grade={g} onSaved={handleSaved}/>)}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-subtle text-sm">
            Nhập mã môn và bấm Tìm để xem danh sách sinh viên
          </div>
        )}
      </div>

      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} onImported={() => { setShowImport(false); handleSearch(); }}/>
      )}
    </div>
  );
}