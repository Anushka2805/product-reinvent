// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add 'Satoshi' as a custom font family
        sans: ['Satoshi', 'sans-serif'],
      },
    },
  },
  plugins: [],
}