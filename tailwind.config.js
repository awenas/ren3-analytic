/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ReN3 Brand Colors
        'ren3': {
          purple: '#6B4FBB',
          'purple-hover': '#5A3FA8',
          dark: '#1A1D21',
        },
        // dbt-inspired palette
        'accent': {
          DEFAULT: '#6B4FBB',
          hover: '#5A3FA8',
        },
        'node': {
          source: '#6B7280',
          model: '#0D9488',
          metric: '#EAB308',
          test: '#EF4444',
        }
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Andale Mono', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
