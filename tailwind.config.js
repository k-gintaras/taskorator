/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#7d4fbf",
        secondary: "#a99ada",
        background: "#b4b4b4",
        headerMain: "#7d4fbf",
        menu: "#bd7fe7",
        headerSecondary: "#a18ac1",
        headerText: "#ffffff",
        accentGreen: "#6c757d",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
    },
  },
  plugins: [require("daisyui")], // ← for DaisyUI
};
