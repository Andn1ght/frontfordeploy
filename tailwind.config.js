/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff3ff',
          100: '#dfe6ff',
          200: '#c7d2fe',
          300: '#a4b4fe',
          400: '#8190fc',
          500: '#6677ff', // Main accent
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        dark: {
          100: '#d1d5db',
          200: '#9ca3af',
          300: '#6b7280',
          400: '#4b5563',
          500: '#374151',
          600: '#1f2937',
          700: '#111827',
          800: '#0d1117',
          900: '#070a0f',
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
      },
      transitionProperty: {
        'height': 'height',
      },
    },
  },
  plugins: [],
};