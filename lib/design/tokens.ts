export const designTokens = {
  colors: {
    graphite950: "#07090b",
    graphite900: "#0d1117",
    graphite800: "#151b23",
    whiteIce: "#f4f7fb",
    mist: "#aab4c0",
    electricLime: "#b7ff2a",
    deepBlue: "#1437d8",
    energyOrange: "#ff6a1a",
    signalCyan: "#31d7ff",
    alertRed: "#ff385c"
  },
  spacing: {
    pageX: "clamp(1rem, 3vw, 2.5rem)",
    sectionY: "clamp(2.5rem, 6vw, 6rem)",
    railGap: "1rem"
  },
  radius: {
    control: "0.5rem",
    panel: "0.75rem",
    hero: "1rem"
  },
  shadows: {
    glow: "0 0 40px rgb(183 255 42 / 0.2)",
    orange: "0 0 45px rgb(255 106 26 / 0.22)",
    panel: "0 24px 80px rgb(0 0 0 / 0.38)"
  },
  motion: {
    fast: 0.16,
    normal: 0.26,
    slow: 0.6,
    ease: [0.22, 1, 0.36, 1]
  }
} as const;

export type DesignTokens = typeof designTokens;
