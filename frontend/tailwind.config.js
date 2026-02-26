/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        obsidian: {
          950: '#030712',
          900: '#060d1f',
          800: '#0a1628',
          700: '#0f2040',
          600: '#162a52',
        },
        neon: {
          cyan: '#00e5ff',
          green: '#00ff88',
          purple: '#bf5fff',
          orange: '#ff6b35',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          from: { boxShadow: '0 0 5px #00e5ff, 0 0 10px #00e5ff' },
          to: { boxShadow: '0 0 20px #00e5ff, 0 0 40px #00e5ff, 0 0 60px #00e5ff' },
        },
      },
    },
  },
  plugins: [],
}
