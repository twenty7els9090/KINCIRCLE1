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
        // Liquid Glass Color Palette
        'dark-bg': '#0C0F1E',
        'dark-bg-secondary': '#1A1F35',
        'glass': 'rgba(26, 31, 53, 0.6)',
        'glass-light': 'rgba(26, 31, 53, 0.5)',
        'accent': '#6C5CE7',
        'accent-light': '#5F5FEF',
        'accent-glow': 'rgba(108, 92, 231, 0.3)',
        'accent-glow-strong': 'rgba(108, 92, 231, 0.4)',
        'white-primary': '#FFFFFF',
        'white-secondary': 'rgba(255, 255, 255, 0.6)',
        'white-tertiary': 'rgba(255, 255, 255, 0.4)',
        'white-icon': 'rgba(255, 255, 255, 0.8)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-border-light': 'rgba(255, 255, 255, 0.15)',
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
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '40px',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'glass': '0 20px 40px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.4)',
        'glass-sm': '0 8px 20px rgba(0, 0, 0, 0.4)',
        'neon': '0 0 20px rgba(108, 92, 231, 0.3)',
        'neon-strong': '0 8px 20px rgba(108, 92, 231, 0.4)',
        'neon-button': '0 4px 15px rgba(108, 92, 231, 0.4)',
        'float': '0 -4px 30px rgba(0, 0, 0, 0.5)',
        'inset-dark': 'inset 0 1px 4px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-strong': '25px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.1s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'card-enter': 'cardEnter 0.3s ease-out',
        'card-exit': 'cardExit 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.97)' },
          '100%': { transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108, 92, 231, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(108, 92, 231, 0.5)' },
        },
        cardEnter: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        cardExit: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
      },
    }
  },
  plugins: [tailwindcssAnimate],
};

export default config;
