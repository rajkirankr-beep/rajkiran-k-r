import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#14120f",       // 60% — warm charcoal background
        surface: "#211d19",    // 30% — bento card / border surfaces
        surface2: "#2a251f",   // slightly deeper card variant for depth
        accent: "#c9884a",     // 10% — muted copper
        "accent-soft": "#e0a868",
        ink: "#eae4da",        // warm off-white primary text
        muted: "#9c9284",      // warm gray secondary text
        line: "#332c25",       // hairline borders
      },
      fontFamily: {
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
        rounded: ["var(--font-rubik)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: ["clamp(3.25rem, 9vw, 9rem)", { lineHeight: "0.88", letterSpacing: "-0.03em" }],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(201,136,74,0.4), 0 0 40px -8px rgba(201,136,74,0.55)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset",
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.25" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        blink: "blink 1.6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
