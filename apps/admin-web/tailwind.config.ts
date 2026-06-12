import type { Config } from 'tailwindcss';

// KinniJije — buka-signboard tokens. Extends only; mirror packages/ui theme.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F8EFDF', deep: '#F1E5CE' },
        sheet: '#FFFDF7',
        ink: { DEFAULT: '#221A12', 2: '#45392B', 3: '#7C6E5C', 4: '#AC9F8B' },
        hair: { DEFAULT: '#E6D9C2', 2: '#D8C8AC' },
        danfo: {
          DEFAULT: '#EDAE05',
          deep: '#C99204',
          press: '#A37703',
          tint: '#FAF0CF',
          edge: '#E5CE85',
          soft: '#F6DF8E',
        },
        have: { DEFAULT: '#3E7A3A', bg: '#E9F1E4', edge: '#BFD6B8' },
        crit: { DEFAULT: '#A11212', bg: '#F6E4E1', edge: '#E2B6AE' },
        warn: { DEFAULT: '#9C4A0E', bg: '#F8EBDC', edge: '#E5C6A4' },
      },
      fontFamily: {
        display: ['Bebas Neue', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        display: '0.045em',
        overline: '0.18em',
      },
      borderRadius: {
        card: '5px',
        ctrl: '4px',
      },
      boxShadow: {
        paint: '4px 4px 0 #221A12',
        'paint-sm': '3px 3px 0 #221A12',
        'paint-crit': '6px 6px 0 #A11212',
      },
      backgroundImage: {
        stripe: 'repeating-linear-gradient(45deg, #EDAE05 0 10px, #221A12 10px 20px)',
      },
      transitionTimingFunction: {
        signboard: 'cubic-bezier(.3, 0, .2, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
