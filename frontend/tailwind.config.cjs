/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hud-dark': '#0A0A0A',
        'hud-border': '#2F2F2F',
        'hud-glow': '#00AEEF',
        'hud-highlight': '#FFD700',
        'hud-text': '#E0E0E0',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
      boxShadow: {
        'hud-glow': '0 0 20px rgba(0, 174, 239, 0.5)',
        'hud-glow-lg': '0 0 40px rgba(0, 174, 239, 0.7)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scan-line 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 174, 239, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 174, 239, 0.8)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
