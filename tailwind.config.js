/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#047857',      // emerald-700
          lightGreen: '#d1fae5', // emerald-100
          brown: '#78350f',      // amber-900
          lightBrown: '#fff7ed', // orange-50
          beige: '#f5f5f4',      // stone-100
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}