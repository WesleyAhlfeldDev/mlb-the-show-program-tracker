/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-barlow-condensed)", "sans-serif"],
        body: ["var(--font-barlow)", "sans-serif"],
      },
      colors: {
        bg: "#0d0f12",
        bg2: "#13161b",
        bg3: "#1a1e25",
        bg4: "#222730",
      },
    },
  },
  plugins: [],
}
