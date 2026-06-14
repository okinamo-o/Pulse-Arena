import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        graphite: {
          950: "#07090b",
          900: "#0d1117",
          850: "#111721",
          800: "#151b23",
          700: "#202b38"
        },
        signal: {
          lime: "#b7ff2a",
          orange: "#ff6a1a",
          cyan: "#31d7ff",
          blue: "#1437d8",
          red: "#ff385c"
        }
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgb(183 255 42 / 0.2)",
        "glow-orange": "0 0 45px rgb(255 106 26 / 0.22)",
        "panel": "0 24px 80px rgb(0 0 0 / 0.38)",
        "inner-line": "inset 0 1px 0 rgb(255 255 255 / 0.08)"
      },
      backgroundImage: {
        "arena-radial": "radial-gradient(circle at 18% 8%, rgb(183 255 42 / 0.18), transparent 32%), radial-gradient(circle at 82% 18%, rgb(20 55 216 / 0.28), transparent 36%), radial-gradient(circle at 72% 86%, rgb(255 106 26 / 0.14), transparent 32%)",
        "signal-grid": "linear-gradient(rgb(255 255 255 / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px)",
        "live-gradient": "linear-gradient(135deg, #b7ff2a 0%, #31d7ff 52%, #ff6a1a 100%)"
      },
      keyframes: {
        "pulse-live": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.42)", opacity: "0.38" }
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "radar-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "scan": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        }
      },
      animation: {
        "pulse-live": "pulse-live 1.8s ease-in-out infinite",
        "ticker": "ticker 30s linear infinite",
        "radar-spin": "radar-spin 4.5s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
