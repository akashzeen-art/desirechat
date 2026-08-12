/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', '"Plus Jakarta Sans"', 'sans-serif'],
        headline: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        primary:   '#E91E8C',
        secondary: '#C2187A',
        accent:    '#FF6EB4',
        dark:      '#2D1B35',
        card:      '#FFF5FA',
        surface:   '#FFF0F7',
        muted:     '#7A5C6E',
        pink: {
          50:  '#FFF5FA',
          100: '#FFE8F4',
          200: '#FFD0E8',
          300: '#FFB0D6',
          400: '#FF80BC',
          500: '#FF4DA0',
          600: '#E91E8C',
          700: '#C2187A',
          800: '#9C1462',
          900: '#7A1050',
        },
        rose: {
          50:  '#FFF1F5',
          100: '#FFE4ED',
          200: '#FFCCD9',
          300: '#FFA3BB',
          400: '#FF6B96',
          500: '#F43F72',
          600: '#E11D55',
          700: '#BE1245',
          800: '#9F1040',
          900: '#88103B',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
}
