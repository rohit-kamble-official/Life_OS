/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cyber: {
          50: '#f0feff',
          100: '#ccfeff',
          200: '#99fcff',
          300: '#52f4ff',
          400: '#00e5ff',
          500: '#00c8e8',
          600: '#00a0c4',
          700: '#007fa0',
          800: '#006680',
          900: '#00546a',
        },
        neon: {
          green: '#39ff14',
          pink: '#ff1493',
          yellow: '#ffff00',
          orange: '#ff6600',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00e5ff, 0 0 10px #00e5ff' },
          '100%': { boxShadow: '0 0 20px #00e5ff, 0 0 40px #00e5ff, 0 0 80px #00e5ff' },
        }
      }
    },
  },
  plugins: [],
}
