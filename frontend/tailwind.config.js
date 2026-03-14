/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        black: '#0d0d0d',
        white: '#ffffff',
        primary: '#0d0d0d',
        'background-light': '#f4f4f2',
        'background-dark': '#0d0d0d',
        gray: {
          100: '#f4f4f2',
          200: '#e8e8e4',
          400: '#a0a09a',
          600: '#6b6b64',
        },
        yellow: {
          DEFAULT: '#e8f000',
          soft: '#f0f044',
        }
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #c8d9ea 0%, #d4c9be 45%, #e8dbc8 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
