/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0d0f10',
          alt: '#101315',
          deep: '#14120a',
        },
        cream: '#f5f1e8',
        text: {
          secondary: '#a8a29b',
          nav: '#9c9791',
          muted: '#6b6862',
          placeholder: '#5c5952',
        },
        gold: {
          100: '#f3d98a',
          200: '#e8c766',
          400: '#d4af37',
          600: '#a8802a',
        },
        green: {
          200: '#59c2a4',
          400: '#3fa588',
          600: '#2f7f68',
        },
        bronze: {
          200: '#d6a679',
          400: '#c98f5c',
          600: '#8a5a35',
        },
        red: {
          200: '#c9857b',
          400: '#b3564a',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 20px 40px -24px rgba(0,0,0,0.6)',
        'card-hover': '0 30px 50px -20px rgba(0,0,0,0.7)',
        cta: '0 12px 24px -8px rgba(212,175,55,0.45)',
        mark: '0 4px 12px -4px rgba(212,175,55,0.5)',
        gold: '0 0 24px -4px rgba(212,175,55,0.5)',
      },
      keyframes: {
        podiumRise: {
          from: {
            transform: 'rotateX(24deg) rotateY(-18deg) translateY(50px) scale(0.9)',
            opacity: '0',
          },
          to: {
            transform: 'rotateX(10deg) rotateY(-10deg) translateY(0) scale(1)',
            opacity: '1',
          },
        },
      },
      animation: {
        podiumRise: 'podiumRise 0.9s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};
