import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // KINCIRCLE Color Palette
        burgundy: {
          DEFAULT: "#8B1E3F",
          light: "#A93B5C",
          dark: "#6B1830",
          50: "#FDF5F7",
          100: "#F8E8EC",
          200: "#F0D0D9",
          300: "#E4A8BA",
          400: "#D4809A",
          500: "#C2587A",
          600: "#A93B5C",
          700: "#8B1E3F",
          800: "#6B1830",
          900: "#4A1121",
        },
        // Background colors
        background: {
          DEFAULT: "#FFFFFF",
          card: "#F8F5F5",
          muted: "#F0E8E8",
        },
        // Text colors
        text: {
          primary: "#1C1C1E",
          secondary: "#8E8E93",
          muted: "#AEAEB2",
        },
        // Border and divider
        border: "#E5E0E0",
        divider: "#F0E8E8",
        // Shadcn/ui compatible colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(139, 30, 63, 0.05)',
        'button': '0 4px 12px rgba(139, 30, 63, 0.3)',
        'float': '0 4px 20px rgba(139, 30, 63, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-burgundy': 'pulseBurgundy 0.3s ease-out',
        'highlight': 'highlight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseBurgundy: {
          '0%': { boxShadow: '0 0 0 0 rgba(139, 30, 63, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(139, 30, 63, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(139, 30, 63, 0)' },
        },
        highlight: {
          '0%': { backgroundColor: '#F8E8EC' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    }
  },
  plugins: [tailwindcssAnimate],
};

export default config;
