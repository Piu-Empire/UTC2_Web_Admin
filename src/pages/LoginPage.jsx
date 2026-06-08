import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();
  const [studentCode, setStudentCode] = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);

  function handleMockLogin() {
    localStorage.setItem('utc2_token', 'mock-token');
    localStorage.setItem('utc2_user', JSON.stringify({
      name: 'Admin UTC2', role: 'ADMIN', staffLevel: null, email: 'admin@utc2.edu.vn',
    }));
    navigate('/', { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentCode || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    try {
      const res  = await authApi.login(studentCode, password);
      const data = res.data?.data ?? res.data;
      localStorage.setItem('utc2_token', data.accessToken);
      localStorage.setItem('utc2_user', JSON.stringify({
        name:        data.email?.split('@')[0] ?? data.studentCode ?? 'Admin',
        email:       data.email,
        studentCode: data.studentCode,
        role:        data.role ?? 'ADMIN',
        staffLevel:  data.staffLevel ?? null,
      }));
      const role       = data.role ?? 'ADMIN';
      const staffLevel = data.staffLevel ?? null;
      navigate((role === 'STAFF' && staffLevel === 1) ? '/assessment' : '/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại tài khoản.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex h-screen font-body"
      style={{ background: 'var(--bg-app-radial), var(--bg-app)' }}
    >
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
        }}
      />

      {/* Left decorative panel */}
      <div
        className="hidden md:flex w-[45%] flex-col items-center justify-center px-12 relative overflow-hidden"
        style={{
          borderRight: '1px solid var(--sidebar-border)',
          background: 'var(--sidebar-bg)',
        }}
      >
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '20%',
          width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--avatar-bg) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%',
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--avatar-bg) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="relative z-10 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'var(--logo-bg)', boxShadow: 'var(--logo-shadow)' }}
          >
            <span className="font-display font-bold text-white text-3xl leading-none">U</span>
          </div>

          <h2 className="font-display font-bold text-3xl mt-5 text-gold">UTC2</h2>
          <p className="text-sm mt-2 max-w-[240px] leading-relaxed mx-auto" style={{ color: 'var(--text-subtle)' }}>
            Hệ thống quản trị sinh viên UTC2
          </p>

          <div className="mt-12 space-y-3 text-left">
            {[
              { n: '12,000+', label: 'Sinh viên đang theo học' },
              { n: '500+',    label: 'Học phần trong hệ thống' },
              { n: '6',       label: 'Khoa & bộ môn'           },
            ].map(({ n, label }) => (
              <div
                key={n}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
              >
                <span className="font-display font-bold text-lg w-16" style={{ color: 'var(--gold-primary)' }}>
                  {n}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--logo-bg)' }}
            >
              <span className="font-display font-bold text-white text-base leading-none">U</span>
            </div>
            <span className="font-display font-bold text-lg text-gold">UTC2 Admin</span>
          </div>

          <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Đăng nhập
          </h1>
          <p className="text-sm mt-1 mb-8" style={{ color: 'var(--text-subtle)' }}>
            Chỉ dành cho quản trị viên hệ thống
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Email hoặc MSSV
              </label>
              <input
                type="text"
                value={studentCode}
                onChange={e => setStudentCode(e.target.value)}
                placeholder="VD: admin@utc2.edu.vn hoặc 2211020001"
                autoComplete="username"
                disabled={loading}
                className="w-full px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-medium text-sm py-2.5 rounded-[10px] mt-2 transition-all"
              style={{
                background: loading ? 'rgba(217,119,6,0.5)' : 'var(--btn-primary-bg)',
                color: '#fff',
                border: '1px solid var(--btn-primary-border)',
                boxShadow: loading ? 'none' : 'var(--btn-primary-shadow)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
            <button
              type="button"
              onClick={handleMockLogin}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                border: '1px dashed var(--avatar-border)',
                color: 'var(--gold-primary)',
                background: 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--nav-hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🚧 Đăng nhập thử (Mock)
            </button>
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-subtle)' }}>
              Dùng khi backend chưa chạy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}