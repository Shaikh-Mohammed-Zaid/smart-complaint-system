/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card: '#16162a',
          border: 'rgba(255,255,255,0.12)',
          glass: 'rgba(255,255,255,0.06)',
          glassBorder: 'rgba(255,255,255,0.12)',
        },
        accent: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          rose: '#f43f5e',
          amber: '#f59e0b',
          green: '#10b981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
