/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#007fff",
        "background-light": "#f5f7f8",
        "background-dark": "#0f1923",
        "card-dark": "#16222e",
        "input-dark": "#20364b",
        "text-light": "#EAEAEA",
        "text-muted": "#8dadce",
        "border-dark": "#2e4d6b",
        "success": "#0bda5b",
        "warning": "#ffa726",
        "danger": "#fa6238",
        "info": "#29b6f6"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

