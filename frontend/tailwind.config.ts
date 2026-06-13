import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        cormorant:   ["var(--font-cormorant)", "serif"],
        "space-mono": ["var(--font-mono)", "monospace"],
      },
      colors: {
        void:         "var(--bg-void)",
        stone:        "var(--bg-stone)",
        panel:        "var(--bg-panel)",
        crimson:      "var(--crimson)",
        "crimson-glow": "var(--crimson-glow)",
        marble:       "var(--marble)",
        "marble-dim": "var(--marble-dim)",
        gold:         "var(--gold)",
        "gold-dim":   "var(--gold-dim)",
        celadon:      "var(--celadon)",
        "cf-amber":   "var(--amber)",
      },
    },
  },
  plugins: [],
};
export default config;
