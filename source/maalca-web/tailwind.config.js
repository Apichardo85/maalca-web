/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Habilita dark mode con class strategy
  theme: {
    extend: {
      colors: {
        // Theme system colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-muted': 'var(--surface-muted)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
        'border-muted': 'var(--border-muted)',
        'brand-primary': 'var(--brand-primary)',
        'brand-primary-hover': 'var(--brand-primary-hover)',
        'brand-secondary': 'var(--brand-secondary)',
      },
      fontFamily: {
        'playfair': ['var(--font-playfair)', 'serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        'display': ['var(--font-playfair)', 'serif'],
      }
    },
  },
  plugins: [],
}