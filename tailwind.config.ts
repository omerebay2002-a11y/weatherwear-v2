import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "390px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      fontFamily: {
        sans: ['"Heebo"', "system-ui", "sans-serif"],
        display: ['"Frank Ruhl Libre"', "Georgia", "serif"],
        editorial: ['"Cormorant Garamond"', "Georgia", "serif"],
      },
      colors: {
        // Warm Walnut palette — modern, minimal, no frills
        parchment: {
          DEFAULT: "#F5EFE6",
          light: "#FAF6EE",
          dark: "#E8DDC9",
        },
        ebony: {
          DEFAULT: "#1A1410",
          soft: "#2C2218",
          muted: "#4A3829",
        },
        walnut: {
          50: "#F2EAE0",
          100: "#E5D2BD",
          200: "#C7A685",
          300: "#A47A55",
          400: "#7E5733",  // mid walnut
          500: "#5C3E22",  // primary walnut
          600: "#42291466",
          700: "#2D1A0A",
        },
        brass: {
          DEFAULT: "#B8956A",
          light: "#D9B47C",
          deep: "#8C6B42",
        },
        sage: {
          DEFAULT: "#9BAE94",
          deep: "#647B62",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.04)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        shimmer: "shimmer 2s linear infinite",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 4px 20px -8px rgba(60, 40, 20, 0.25)",
        "soft-lg": "0 12px 32px -12px rgba(60, 40, 20, 0.3)",
        brass: "0 0 0 1px rgba(184, 149, 106, 0.4), 0 4px 16px -6px rgba(184, 149, 106, 0.35)",
      },
    },
  },
  plugins: [],
} satisfies Config;
