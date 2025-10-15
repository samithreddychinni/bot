/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E1E2E',
        'secondary': '#313244',
        'accent': '#89B4FA',
        'text-primary': '#CDD6F4',
        'text-secondary': '#A6ADC8',
        'highlight': '#FAB387',
        'success': '#A6E3A1',
        'danger': '#F38BA8',
      },
    },
  },
  plugins: [],
}
