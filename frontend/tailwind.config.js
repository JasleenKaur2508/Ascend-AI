/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pearl: '#F8F7FD',
        lavender: '#F1EEFD',
        lavenderDark: '#E4DEF9',
        periwinkle: '#8FA9FE',
        icyBlue: '#E7F0FE',
        charcoal: '#212032',
        muted: '#7E7C94',
        borderSubtle: 'rgba(230, 226, 248, 0.85)',
        accent: {
          violet: '#7765E8',
          periwinkle: '#8EA5FE',
          softBlue: '#9BB9FF',
          hover: '#6451D8',
          glow: 'rgba(119, 101, 232, 0.22)'
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7765e8',
          600: '#6451d8',
          700: '#533ec4',
          800: '#43329f',
          900: '#34277b',
          950: '#1f164b',
        },
        surface: {
          50: '#faf8fd',
          100: '#f2eefd',
          200: '#e7e2f8',
          300: '#d8d0f2',
          800: '#35334c',
          900: '#212032',
          950: '#151423',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'liquid': '0 14px 34px -4px rgba(119, 101, 232, 0.09), 0 4px 14px -2px rgba(143, 169, 254, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        'liquid-hover': '0 24px 48px -6px rgba(119, 101, 232, 0.16), 0 8px 20px -2px rgba(143, 169, 254, 0.15), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 1)',
        'glow-violet': '0 0 28px -4px rgba(119, 101, 232, 0.35)',
        'glow-periwinkle': '0 0 28px -4px rgba(143, 169, 254, 0.4)',
      }
    },
  },
  plugins: [],
}
