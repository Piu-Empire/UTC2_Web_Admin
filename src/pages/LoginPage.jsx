import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { authApi } from '../api/authApi';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  function handleMockLogin() {
    localStorage.setItem("utc2_token", "mock-token");
    localStorage.setItem("utc2_user", JSON.stringify({ name: "Admin UTC2", role: "ADMIN" }));
    navigate("/", { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin.', { position: 'top-center' });
      return;
    }

    setLoading(true);
    try {
      const res  = await authApi.login(email, password);
      const data = res.data?.data ?? res.data;

      localStorage.setItem('utc2_token', data.token);
      localStorage.setItem('utc2_user', JSON.stringify({ name: data.name, role: data.role }));

      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Kiểm tra lại tài khoản.';
      toast.error(msg, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen font-body">
      {/* ── Toast (top-center override for this page) ── */}
      <Toaster position="top-center" />

      {/* ── Left panel ─────────────────────────────── */}
      <div
        className="hidden md:flex w-[45%] flex-col items-center justify-center px-12 relative overflow-hidden"
        style={{ background: '#1e3a8a' }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg,   transparent, transparent 39px, rgba(255,255,255,0.05) 40px),
              repeating-linear-gradient(90deg,  transparent, transparent 39px, rgba(255,255,255,0.05) 40px)
            `,
          }}
        />

        {/* Brand block */}
        <div className="relative z-10 text-center">
          {/* Logo mark */}
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mx-auto">
            <span className="font-display font-bold text-white text-2xl leading-none">U</span>
          </div>

          <h2 className="font-display font-bold text-white text-2xl mt-4">UTC2</h2>
          <p className="font-body font-light text-white/80 text-sm mt-2 max-w-[260px] leading-relaxed">
            Quản trị hệ thống sinh viên UTC2
          </p>

          {/* Decorative stat pills */}
          <div className="mt-12 space-y-3 text-left">
            {[
              { n: '12,000+', label: 'Sinh viên đang theo học' },
              { n: '500+',    label: 'Học phần trong hệ thống' },
              { n: '6',       label: 'Khoa & bộ môn' },
            ].map(({ n, label }) => (
              <div
                key={n}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
              >
                <span className="font-display font-bold text-white text-lg w-16">{n}</span>
                <span className="text-white/70 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────── */}
      <div className="flex-1 bg-white flex items-center justify-center px-6">
        <div className="w-full max-w-sm py-16">
          {/* Mobile logo (hidden on md+) */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center">
              <span className="font-display font-bold text-white text-base leading-none">U</span>
            </div>
            <span className="font-display font-bold text-ink text-lg">UTC2 Admin</span>
          </div>

          <h1 className="font-display font-bold text-2xl text-ink">Đăng nhập</h1>
          <p className="text-sm text-ink-muted mt-1 mb-8">
            Chỉ dành cho quản trị viên hệ thống
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@utc2.edu.vn"
                autoComplete="email"
                disabled={loading}
                className="
                  border border-surface-border rounded-lg px-3 py-2.5
                  text-sm w-full text-ink placeholder:text-ink-subtle
                  focus:outline-none focus:ring-2 focus:ring-brand-500
                  disabled:opacity-50
                "
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
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
                  className="
                    border border-surface-border rounded-lg px-3 py-2.5 pr-10
                    text-sm w-full text-ink placeholder:text-ink-subtle
                    focus:outline-none focus:ring-2 focus:ring-brand-500
                    disabled:opacity-50
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  tabIndex={-1}
                  className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-ink-subtle hover:text-ink transition-colors
                  "
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-brand-600 hover:bg-brand-700 text-white
                font-medium py-2.5 rounded-lg text-sm
                transition-colors flex items-center justify-center gap-2
                disabled:opacity-60 disabled:cursor-not-allowed
                mt-2
              "
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Mock login for dev */}
          <div className="mt-4 pt-4 border-t border-surface-border">
            <button
              type="button"
              onClick={handleMockLogin}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-dashed border-amber-400 text-amber-600 hover:bg-amber-50 transition-colors"
            >
              🚧 Đăng nhập thử (Mock)
            </button>
            <p className="text-xs text-ink-subtle text-center mt-2">Dùng khi backend chưa chạy</p>
          </div>
        </div>
      </div>
    </div>
  );
}