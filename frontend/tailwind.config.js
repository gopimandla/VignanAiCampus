/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm Neutral & Cocoa Palette
        warm: {
          50: '#FAF7F2',   // Warm Ivory / Very Light Cream
          100: '#F5EFEB',  // Soft Warm Cream
          200: '#EAE1D7',  // Pale Beige
          300: '#DDD0C2',  // Light Tan
          400: '#C8B6A4',  // Warm Sand
          500: '#B09B86',  // Soft Taupe
          600: '#8C745E',  // Warm Cocoa
          700: '#6E5844',  // Deep Cocoa Brown
          800: '#4F3D2F',  // Rich Espresso Brown
          900: '#382B21',  // Dark Cocoa
          950: '#231A14',  // Deepest Charcoal-Brown
        },
        // Soft Blush Pink & Dusty Rose Accents
        blush: {
          50: '#FDF7F7',   // Nude Tint
          100: '#F9ECEE',  // Very Light Nude Pink
          200: '#F2D7DA',  // Soft Powder Blush
          300: '#E5B9BD',  // Dusty Rose Light
          400: '#D5949B',  // Muted Rose
          500: '#BF6F77',  // Elegant Blush Rose
          600: '#A4535B',  // Deep Dusty Rose
          700: '#863E45',  // Wine Rose
          800: '#6C3137',
          900: '#5A2B30',
        },
        // Soft Peach / Light Terracotta
        peach: {
          50: '#FAF5EE',
          100: '#F5E8D8',
          200: '#EBD0B3',
          300: '#DCB38A',
          400: '#CC9464',
          500: '#B57846',
          600: '#945D33',
        },
        // Muted Sage Green for Positive Status
        sage: {
          50: '#F2F6F3',
          100: '#E3EDE5',
          200: '#C7DBCB',
          300: '#A5C4AB',
          400: '#7FA887',
          500: '#5D8B66',
          600: '#466E4E',
          700: '#36553D',
        },
        // Soft Amber / Warm Terracotta for Warnings
        amberwarm: {
          50: '#FDF8F2',
          100: '#F9EEE0',
          200: '#F2D9BE',
          300: '#E7BD93',
          400: '#D69B64',
          500: '#BC7A3F',
          600: '#9E5F2D',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(79, 61, 47, 0.06), 0 1px 2px -1px rgba(79, 61, 47, 0.04)',
        'warm-md': '0 4px 6px -1px rgba(79, 61, 47, 0.08), 0 2px 4px -2px rgba(79, 61, 47, 0.06)',
        'warm-lg': '0 10px 15px -3px rgba(79, 61, 47, 0.08), 0 4px 6px -4px rgba(79, 61, 47, 0.04)',
        'warm-xl': '0 20px 25px -5px rgba(79, 61, 47, 0.1), 0 8px 10px -6px rgba(79, 61, 47, 0.06)',
      }
    },
  },
  plugins: [],
}
