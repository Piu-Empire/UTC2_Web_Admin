/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted:   '#f8fafc',
          border:  '#e2e8f0',
          hover:   '#f1f5f9',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted:   '#64748b',
          subtle:  '#94a3b8',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          error:   '#ef4444',
          info:    '#3b82f6',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['"Inter"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm:    '6px',
        DEFAULT: '10px',
        md:    '12px',
        lg:    '16px',
        xl:    '20px',
        '2xl': '24px',
        full:  '9999px',
      },
    },
  },
  plugins: [],
};
