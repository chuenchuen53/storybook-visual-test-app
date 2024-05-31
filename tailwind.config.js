/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  darkMode: "class",
  plugins: [],
  theme: {
    extend: {
      colors: {
        primary: "var(--p-primary-color)",
        muted: "var(--p-text-muted-color)",
      },
    },
  },
};
