/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Noto Sans Sinhala'", "'IBM Plex Sans'", "sans-serif"]
      }
    }
  },
  plugins: []
};
