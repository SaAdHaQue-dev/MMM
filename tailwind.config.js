/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FAF7F2',
          card: '#FFFFFF',
          secondary: '#F5EFEB',
          accent: '#FBF4EC',
        },
        wine: {
          50: '#FDF2F4',
          100: '#FBE6E9',
          200: '#F7CCD3',
          300: '#F0A3B0',
          400: '#E46E84',
          500: '#CE3B5A',
          600: '#B02644',
          700: '#8C1B33',
          800: '#722F37', // Brand Primary
          900: '#52121E',
          950: '#340610',
        },
        gold: {
          50: '#FCFBF6',
          100: '#F8F4E8',
          200: '#EFE5C6',
          300: '#E3D29D',
          400: '#D4AF37', // Brand Gold
          500: '#C5A059',
          600: '#A98440',
          700: '#866430',
          800: '#684C26',
          900: '#4F381D',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          200: '#D1D1D1',
          300: '#B0B0B0',
          400: '#888888',
          500: '#6D6D6D',
          600: '#5D5D5D',
          700: '#474747',
          800: '#2A2928',
          900: '#1C1917', // Dark text
        },
        sand: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F1E9D7',
          300: '#E7DABE',
          400: '#D9C6A2',
          500: '#C9B086',
          border: '#E8E0D5',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'wedding': '0 4px 20px -2px rgba(114, 47, 55, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'wedding-lg': '0 10px 30px -4px rgba(114, 47, 55, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
