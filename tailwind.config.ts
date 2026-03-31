import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        bg: "#0d0f10",
        surface: "#141618",
        border: "#2a2d2f",
        green: {
          DEFAULT: "#4ade80",
          dim: "#1a3a24",
        },
        amber: {
          DEFAULT: "#f59e0b",
        },
        muted: "#555e66",
        text: "#d4d8db",
      },
    },
  },
  plugins: [],
};

export default config;
