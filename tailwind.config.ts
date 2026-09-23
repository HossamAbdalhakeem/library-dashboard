import type { Config } from 'tailwindcss';

export default <Partial<Config>>{
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'black',
        forest: '#0d665d',
        mint: '#dff1e8',
        paper: '#f8faf7',
        muted: '#66736e',
        primary: {
          DEFAULT: '#f5af52',
          50: '#fef8ee',
          100: '#fcefd9',
          200: '#f9ddb2',
          300: '#f7c882',
          400: '#f6bb6a',
          500: '#f5af52',
          600: '#e09a3a',
          700: '#bc7d2c',
          800: '#976328',
          900: '#7a5124',
          950: '#422a11',
        },
      },
      fontFamily: {
        sans: ['"Trebuchet MS"', '"Segoe UI"', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      keyframes: {
        'login-orb-float': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0) scale(1)' },
          '50%': { transform: 'translate3d(0, -18px, 0) scale(1.06)' },
        },
      },
      animation: {
        'login-orb-float': 'login-orb-float 10s ease-in-out infinite',
        'login-orb-float-slow': 'login-orb-float 12s ease-in-out infinite reverse',
        'login-orb-float-delayed': 'login-orb-float 8s ease-in-out 1s infinite',
      },
    },
  },
  plugins: [],
};
