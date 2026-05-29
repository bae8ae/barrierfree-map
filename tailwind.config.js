/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard Variable',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        // Primary: 딥 민트 / 블루 그린
        primary: {
          50: '#e6f7f4',
          100: '#c2ebe4',
          200: '#8ddace',
          300: '#52c5b3',
          400: '#26ad99',
          500: '#0e9e8b',
          600: '#0a8174',
          700: '#0a675e',
          800: '#0b524b',
          900: '#0a443f',
        },
        // Secondary: 라벤더
        lavender: {
          100: '#efeafe',
          200: '#ddd3fb',
          300: '#c3b2f6',
          400: '#a98ff0',
          500: '#8f6ae6',
        },
        // 위험/불편: 코랄 레드
        coral: {
          100: '#ffe6e2',
          300: '#ffae9f',
          500: '#ff6b52',
          600: '#ed4f34',
          700: '#c83a22',
        },
        // 안전/이동 가능: 민트 그린
        mint: {
          100: '#dcfce9',
          300: '#86e8b3',
          500: '#22c476',
          600: '#16a35e',
        },
        // 공공시설: 블루
        publicblue: {
          100: '#dbeafe',
          300: '#93c5fd',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // 주의: 노랑
        caution: {
          100: '#fef6d8',
          300: '#fcd965',
          500: '#f5b921',
          600: '#d99708',
        },
        tactile: {
          500: '#27408b',
          600: '#1e3270',
        },
        cream: '#fdfbf6',
        warmwhite: '#fbf9f4',
        softblue: '#eef4fb',
        ink: '#1f2a37',
        subtle: '#5b6675',
      },
      boxShadow: {
        card: '0 2px 12px rgba(31, 42, 55, 0.08)',
        sheet: '0 -6px 28px rgba(31, 42, 55, 0.14)',
        float: '0 6px 20px rgba(14, 158, 139, 0.28)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        idleBob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        sheetUp: {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        popIn: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        idleBob: 'idleBob 2.6s ease-in-out infinite',
        pulseRing: 'pulseRing 2.4s ease-out infinite',
        sheetUp: 'sheetUp 0.28s ease-out',
        popIn: 'popIn 0.22s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
