import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#02040a", // Deep near-black
        surface: "rgba(255, 255, 255, 0.045)",
        surfaceSecondary: "rgba(255, 255, 255, 0.025)",
        glassBorder: "rgba(255, 255, 255, 0.10)",
        glassBorderSecondary: "rgba(255, 255, 255, 0.07)",
        accentGold: "#d4af37", // Soft gold
        accentCyan: "#00d2ff",
        textPrimary: "#f8f9fa",
        textSecondary: "#8f9ba8",
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px rgba(255, 255, 255, 0.1)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 210, 255, 0.3)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'radial-spotlight': 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.1), transparent 50%), radial-gradient(circle at bottom left, rgba(0, 210, 255, 0.05), transparent 50%)',
      },
      animation: {
        'float-slow': 'float 7s ease-in-out infinite',
        'float-medium': 'float 5s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'scan': 'scan 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
