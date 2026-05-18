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
        stone: {
          50: "#F5F0E8",
          100: "#E8DCC8",
          200: "#D4C4A8",
        },
        terracotta: {
          DEFAULT: "#C0694A",
          light: "#D4876B",
          dark: "#A05238",
        },
        charcoal: {
          DEFAULT: "#2C2C2C",
          light: "#4A4A4A",
        },
        sage: {
          DEFAULT: "#7A9E7E",
          light: "#9BB89E",
          dark: "#5E7D62",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
