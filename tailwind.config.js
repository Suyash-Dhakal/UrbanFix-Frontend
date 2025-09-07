/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "building-float": "building-float 8s ease-in-out infinite",
        "window-flicker": "window-flicker 3s ease-in-out infinite",
        "car-move-right": "car-move-right 15s linear infinite",
        "car-move-left": "car-move-left 12s linear infinite",
        "bounce-slow": "bounce-slow 3s ease-in-out infinite",
        "fade-in": "fade-in 1s ease-out forwards",
        "fade-in-delayed": "fade-in 1s ease-out 1.5s forwards",
        "float-slow": "float-slow 10s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "line-draw": "line-draw 3s ease-in-out infinite alternate",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "building-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "window-flicker": {
          "0%, 100%": { opacity: 0.7 },
          "50%": { opacity: 0.3 },
        },
        "car-move-right": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(calc(100vw + 100%))" },
        },
        "car-move-left": {
          "0%": { transform: "translateX(calc(100vw + 100%))" },
          "100%": { transform: "translateX(-100%)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-10px) translateX(5px)" },
          "50%": { transform: "translateY(0) translateX(10px)" },
          "75%": { transform: "translateY(10px) translateX(5px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: 0.2 },
          "50%": { opacity: 0.8 },
        },
        "line-draw": {
          "0%": { strokeDashoffset: 100 },
          "100%": { strokeDashoffset: 0 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
