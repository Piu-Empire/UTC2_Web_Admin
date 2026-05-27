// src/utils/formatters.js

/** Initials from full name (last 2 words) */
export function initials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
}

/** GPA -> Tailwind text class */
export function gpaColor(gpa) {
    if (gpa == null || gpa === '') return 'text-ink-muted';
    const n = parseFloat(gpa);
    if (n >= 3.2) return 'text-emerald-600 font-semibold';
    if (n >= 2.5) return 'text-ink';
    if (n >= 2.0) return 'text-amber-600';
    return 'text-rose-600 font-semibold';
}

/** Student status -> Badge variant (khop DB tieng Viet) */
export function statusVariant(status) {
    if (status === '\u0111ang h\u1ecdc') return 'success';
    if (status === 'b\u1ea3o l\u01b0u') return 'warning';
    if (status === '\u0111\u00e3 t\u1ed1t nghi\u1ec7p') return 'info';
    if (status === '\u0111\u00ecnh ch\u1ec9') return 'error';
    // Fallback tieng Anh
    if (status === 'ACTIVE') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'GRADUATED') return 'info';
    if (status === 'SUSPENDED') return 'error';
    return 'neutral';
}

/** Fee status -> Badge variant (khop DB V6) */
export function feeVariant(status) {
    if (status === '\u0111\u00e3 \u0111\u00f3ng \u0111\u1ee7') return 'success';
    if (status === 'ch\u01b0a \u0111\u00f3ng') return 'error';
    return 'neutral';
}

/** Seconds ago -> Vietnamese time string */
export function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return 'V\u1eeba xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' ph\u00fat tr\u01b0\u1edbc';
    if (diff < 86400) return Math.floor(diff / 3600) + ' gi\u1edd tr\u01b0\u1edbc';
    return Math.floor(diff / 86400) + ' ng\u00e0y tr\u01b0\u1edbc';
}

/** Format VND */
export function vnd(amount) {
    if (amount == null) return '\u2014';
    return Number(amount).toLocaleString('vi-VN') + ' \u20ab';
}