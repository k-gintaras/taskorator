/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,css,scss,mdx}"],
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
  plugins: [require("daisyui").default],
  daisyui: {
    themes: [
      {
        taskorator: {
          "base-100": "var(--bg-surface)",
          "base-200": "var(--bg-primary)",
          primary: "var(--purple-primary)",
          secondary: "var(--purple-light)",
          "primary-content": "#ffffff",
          neutral: "var(--card-bg)",
          accent: "var(--purple-light)",
          info: "#2980b9",
          success: "#27ae60",
          warning: "#ffcc00",
          error: "#c0392b",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
  },
  safelist: [
    "theme-card",
    "theme-content",
    "theme-text-primary",
    "theme-text-secondary",
    "theme-text-muted",
    "theme-btn-primary",
    "theme-btn-secondary",
    "theme-nav-item",
    "tab",
    "tab-active",
    "btn",
  ],
};
