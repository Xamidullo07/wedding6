/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fon: iliq krem
        paper: {
          50: '#fffdf8',
          100: '#fbf8f1',
          200: '#f3ede0',
        },
        // Yumshoq feruza (fon boʻlaklari va ramkalar)
        aqua: {
          50: '#f0f9f7',
          100: '#e1f3f0',
          200: '#c3e5df',
          300: '#9ad2ca',
          400: '#5fb5ab',
        },
        // Matn: toʻq feruza
        deep: {
          700: '#1e5a5c',
          800: '#14484b',
          900: '#0b3336',
        },
        // Oltin
        gold: {
          100: '#f6ecd2',
          200: '#ecd9a6',
          300: '#dcb76f',
          400: '#cfa557',
          500: '#b88b3e',
          600: '#97702f',
          700: '#7a5a24',
        },
        // Ikkinchi darajali matn
        muted: '#4f7270',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Cormorant', 'Georgia', 'serif'],
        sans: ['Jost', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        petalFall: {
          '0%': { transform: 'translate3d(0, -12vh, 0) rotate(0deg)' },
          '100%': { transform: 'translate3d(60px, 112vh, 0) rotate(360deg)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'petal-fall': 'petalFall 14s linear infinite',
        'fade-in': 'fadeIn 1.4s ease-out both',
        'fade-up': 'fadeUp 1s ease-out both',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};