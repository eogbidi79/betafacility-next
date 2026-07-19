import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        // Beta Facility brand orange (#ff751f)
        brand: {
          50: "#fff4ec",
          100: "#ffe6d3",
          200: "#ffc8a5",
          300: "#ffa36c",
          400: "#ff8a45",
          500: "#ff751f",
          600: "#ed5c0a",
          700: "#c4460b",
          800: "#9c3910",
          900: "#7e3110",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          soft: "#3f3f3f",
          muted: "#545454",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.04)",
        "card-hover":
          "0 12px 24px -6px rgba(16,24,40,.12), 0 4px 8px -4px rgba(16,24,40,.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up .5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
