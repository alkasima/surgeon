import type {Config} from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-inter)', 'sans-serif'],
        headline: ['var(--font-inter)', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Status Colors defined by referencing CSS variables from globals.css
        'status-none-bg': 'hsl(var(--status-none-background))',
        'status-none-text': 'hsl(var(--status-none-foreground))',
        'status-none-border': 'hsl(var(--status-none-border))',
        'status-contacted-bg': 'hsl(var(--status-contacted-background))',
        'status-contacted-text': 'hsl(var(--status-contacted-foreground))',
        'status-contacted-border': 'hsl(var(--status-contacted-border))',
        'status-responded-bg': 'hsl(var(--status-responded-background))',
        'status-responded-text': 'hsl(var(--status-responded-foreground))',
        'status-responded-border': 'hsl(var(--status-responded-border))',
        'status-pricegiven-bg': 'hsl(var(--status-pricegiven-background))',
        'status-pricegiven-text': 'hsl(var(--status-pricegiven-foreground))',
        'status-pricegiven-border': 'hsl(var(--status-pricegiven-border))',
        'status-consultdone-bg': 'hsl(var(--status-consultdone-background))',
        'status-consultdone-text': 'hsl(var(--status-consultdone-foreground))',
        'status-consultdone-border': 'hsl(var(--status-consultdone-border))',
        'status-archived-bg': 'hsl(var(--status-archived-background))',
        'status-archived-text': 'hsl(var(--status-archived-foreground))',
        'status-archived-border': 'hsl(var(--status-archived-border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    }, // Closes extend
  }, // Closes theme
  plugins: [require("tailwindcss-animate")],
};

export default config;
