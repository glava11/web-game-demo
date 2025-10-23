/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff00ff",
        secondary: "#8b5cf6",
        success: "#31da58",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
};
