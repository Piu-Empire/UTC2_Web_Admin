// src/utils/formatters.js

/** Initials from full name (last 2 words) */
export function initials(name = '') {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
}

/** GPA → Tailwind text class */
export function gpaColor(gpa) {
  if (gpa == null || gpa === '') return 'text-ink-muted';
  const n = parseFloat(gpa);
  if (n >= 3.2) return 'text-emerald-600 font-semibold';
  if (n >= 2.5) return 'text-ink';
  if (n >= 2.0) return 'text-amber-600';
  return 'text-rose-600 font-semibold';
}

/** Student status → Badge variant */
export function statusVariant(status) {
  const map = {
    'Đang học':   'success',
    'Bảo lưu':    'warning',
    'Tốt nghiệp': 'info',
    'Đình chỉ':   'error',
  };
  return map[status] ?? 'neutral';
}

/** Fee status → Badge variant */
export function feeVariant(status) {
  const map = {
    'Đã đóng':   'success',
    'Chưa đóng': 'error',
    'Đóng 1 phần': 'warning',
  };
  return map[status] ?? 'neutral';
}

/** Seconds ago → Vietnamese time string */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return 'Vừa xong';
  if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

/** Format VND */
export function vnd(amount) {
  if (amount == null) return '—';
  return Number(amount).toLocaleString('vi-VN') + ' ₫';
}