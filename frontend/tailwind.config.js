/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Muted forest / sage — intentional, not default UI blue or rainbow accents
        primary: {
          50: '#f4f6f3',
          100: '#e6ebe4',
          200: '#ced8ca',
          300: '#a7b6a1',
          400: '#7d9174',
          500: '#5f7356',
          600: '#4a5c44',
          700: '#3c4b38',
          800: '#323e2f',
          900: '#2b3529',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


