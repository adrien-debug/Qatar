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
          // Couleur principale HEARST (Signature) - Vert néon doux
          green: "#7CFF5A",
          primary: "#7CFF5A",
          "primary-dark": "#6ae048",
          "primary-light": "#8eff6c",
          // Backgrounds - Dark Mode Premium
          dark: "#050607",
          "dark-900": "#050607",
          "dark-800": "#0a0b0d",
          "dark-700": "#111315",
          "bg-primary": "#050607",
          "bg-secondary": "#111315",
          "bg-tertiary": "#15181d",
          "bg-hover": "#1a1d22",
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


