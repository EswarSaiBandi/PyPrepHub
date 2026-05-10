import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.md'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          200: '#bcdfff',
          300: '#8ecbff',
          400: '#59adff',
          500: '#2f8cff',
          600: '#1870f5',
          700: '#1358de',
          800: '#164ab3',
          900: '#17418c',
          950: '#112a58',
        },
        ink: {
          50: '#f6f7f9',
          100: '#ebedf2',
          200: '#d3d7e0',
          300: '#adb3c2',
          400: '#80879c',
          500: '#606781',
          600: '#4b526a',
          700: '#3e4357',
          800: '#363a49',
          900: '#1a1d29',
          950: '#0e1019',
        },
      },
      typography: ({ theme }: { theme: (k: string) => string }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-links': theme('colors.brand.600'),
            '--tw-prose-invert-links': theme('colors.brand.400'),
            maxWidth: '72ch',
            a: { textDecoration: 'none', fontWeight: '600' },
            'a:hover': { textDecoration: 'underline' },
            code: {
              fontWeight: '500',
              padding: '0.15rem 0.35rem',
              borderRadius: '0.3rem',
              backgroundColor: theme('colors.ink.100'),
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            'pre code': { backgroundColor: 'transparent', padding: '0' },
          },
        },
        invert: {
          css: {
            code: { backgroundColor: theme('colors.ink.800') },
          },
        },
      }),
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
      },
    },
  },
  plugins: [typography],
}

export default config
