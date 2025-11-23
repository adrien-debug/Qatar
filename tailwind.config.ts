import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hearst: {
          // Couleur principale HEARST (Signature)
          green: "#8afd81",
          primary: "#8afd81",
          "primary-dark": "#6fdc66",
          "primary-light": "#a5ff9c",
          // Backgrounds
          dark: "#000000",
          "dark-900": "#0A0A0A",
          "dark-800": "#141414",
          "dark-700": "#1A1A1A",
          "bg-primary": "#0a0a0a",
          "bg-secondary": "#1a1a1a",
          "bg-tertiary": "#242424",
          "bg-hover": "#2a2a2a",
          // Nuances de gris
          "grey-100": "#2a2a2a",
          "grey-200": "#3a3a3a",
          "grey-300": "#4a4a3a",
          "grey-400": "#666666",
          "grey-500": "#999999",
          // Textes
          text: "#ffffff",
          "text-secondary": "#cccccc",
          "text-muted": "#999999",
          // Accents
          mint: "#7bed9f",
          success: "#27ae60",
          warning: "#f39c12",
          danger: "#ff6b6b",
          error: "#e74c3c",
          info: "#3498db",
          // Aliases
          light: "#0a0a0a",
          white: "#FFFFFF",
        },
        // Couleur de référence Qatar (rouge bordeaux/marron - plus voyant)
        "qatar-red": "#E6396F",
        "qatar-primary": "#E6396F",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
export default config;


