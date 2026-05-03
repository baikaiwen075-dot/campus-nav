import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1d2026",
        mist: "#f5f7fb",
        line: "rgba(122, 132, 156, 0.2)"
      },
      boxShadow: {
        soft: "0 16px 50px rgba(31, 41, 55, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
