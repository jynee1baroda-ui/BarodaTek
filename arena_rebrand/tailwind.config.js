/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'arena-bg': '#000000',
        'arena-black': '#0a0a0a',
        'arena-red': '#ff0033',
        'arena-red-dark': '#cc0029',
        'arena-red-glow': 'rgba(255, 0, 51, 0.5)',
        'arena-text': '#ffffff',
        'arena-gray': '#c0c0c0',
        'arena-dark-gray': '#1a1a1a',
        'arena-mid-gray': '#2a2a2a',
      },
      fontFamily: {
        'heading': ['Orbitron', 'Inter', 'sans-serif'],
        'body': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideUp': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { 
            textShadow: '0 0 20px rgba(255, 0, 51, 0.5), 0 0 40px rgba(255, 0, 51, 0.3)' 
          },
          '50%': { 
            textShadow: '0 0 30px rgba(255, 0, 51, 0.8), 0 0 60px rgba(255, 0, 51, 0.5)' 
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 0, 51, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 0, 51, 0.6)' 
          },
        },
      },
    },
  },
  plugins: [],
}
