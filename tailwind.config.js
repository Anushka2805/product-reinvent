/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["ui-sans-serif", "system-ui"] },
      colors: { brand: "#0ea5e9" }
    },
  },
  plugins: [],
}
