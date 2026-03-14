/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['Outfit', 'sans-serif'],
      },
      colors: {
        black: '#0d0d0d',
        white: '#ffffff',
        primary: '#0d0d0d',
        'background-light': '#f4f4f2',
        'background-dark': '#0d0d0d',
        'background-pro-blue': '#0a192f',
        gray: {
          100: '#f4f4f2',
          200: '#e8e8e4',
          400: '#a0a09a',
          600: '#6b6b64',
        },
        yellow: {
          DEFAULT: '#e8f000',
          soft: '#f0f044',
        },
        'accent-cyan': '#00f5ff',
        'accent-purple': '#a855f7',
        'accent-red': '#ef4444',
        'accent-green': '#10b981',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(180deg, #d3e5ff 0%, #ffffff 50%, #f7ebd7 100%)',
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
