/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-barlow-condensed)", "sans-serif"],
        body:    ["var(--font-barlow)", "sans-serif"],
      },
      colors: {
        bg:  "#080c14",
        bg2: "#0d1424",
        bg3: "#141d30",
        bg4: "#1c2840",
        gold: {
          DEFAULT: "#f0b429",
          light:   "#ffd166",
          dark:    "#c8901a",
          muted:   "#a07010",
        },
      },
      boxShadow: {
        gold:    "0 0 24px rgba(240,180,41,0.18), 0 0 8px rgba(240,180,41,0.10)",
        "gold-sm": "0 0 10px rgba(240,180,41,0.15)",
        "card-hover": "0 4px 24px rgba(0,0,0,0.4), 0 0 16px rgba(240,180,41,0.08)",
      },
    },
  },
  plugins: [],
}
