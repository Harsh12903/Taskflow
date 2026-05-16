/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d4',
          300: '#86efb0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        surface: {
          50:  '#f8faf9',
          100: '#f0f4f2',
          200: '#dde6e1',
          300: '#c4d3cb',
          800: '#1a2420',
          850: '#141c19',
          900: '#0e1512',
          950: '#090e0b',
        }
      },
      animation: {
        'fade-in':       'fadeIn 0.3s ease-out',
        'slide-up':      'slideUp 0.3s ease-out',
        'slide-in-right':'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' },                          to: { opacity: '1' } },
        slideUp:      { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
};