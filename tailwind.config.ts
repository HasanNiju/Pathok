import type { Config } from "tailwindcss";

// All colors are driven by CSS variables (defined in globals.css) so that
// light/dark theming works through class toggling via next-themes.
// No hardcoded hex colors are used anywhere in components — everything
// consumes these Tailwind tokens instead.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        // "Large Radius" per design system — lg is the base unit consumed
        // everywhere; sm/md are derived down from it for smaller controls.
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 8px)",
        "2xl": "calc(var(--radius) + 16px)",
      },
      boxShadow: {
        // "Soft Shadow" — one consistent soft-elevation token for cards.
        soft: "0 2px 10px -2px rgb(0 0 0 / 0.06), 0 8px 24px -8px rgb(0 0 0 / 0.08)",
        "soft-lg": "0 4px 16px -4px rgb(0 0 0 / 0.08), 0 16px 40px -12px rgb(0 0 0 / 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        // Reader-module "Literary" font-family option.
        literary: ["var(--font-literary)", "Georgia", "serif"],
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      spacing: {
        // Extra generous spacing steps beyond Tailwind defaults, used for
        // section/page-level rhythm ("Generous" spacing in design system).
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      maxWidth: {
        // Comfortable reading width for body/reader typography.
        reading: "42rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
