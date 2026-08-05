/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'f1-red': '#E10600',
        'f1-black': '#0B0B0F',
        'f1-asphalt': '#15151E',
        'f1-card-bg': '#1F1F27',
        'f1-border-grey': '#38383F',
        'f1-text-muted': '#94A3B8',
      },
      fontFamily: {
        'f1-font': ['"Titillium Web"', 'sans-serif'],
        sans: ['"Titillium Web"', 'system-ui', 'sans-serif'],
        manrope: ['"Manrope"', 'sans-serif'],
        inter: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
