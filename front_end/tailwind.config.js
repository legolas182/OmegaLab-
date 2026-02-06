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
        "background-dark": "var(--bg-body)",
        "card-dark": "var(--bg-card)",
        "input-dark": "var(--bg-input)",
        "text-light": "var(--text-primary)",
        "text-muted": "var(--text-muted)",
        "border-dark": "var(--border-color)",
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

