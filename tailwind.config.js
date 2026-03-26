/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ctBlue: '#2563eb',
        ctBg: '#f8fafc'
      }
    },
  },
  plugins: [],
};
