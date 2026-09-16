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
        primary: {
          50: '#f0f4ff',
          100: '#dbe4fe',
          200: '#bfd0fe',
          300: '#93b1fd',
          400: '#6088fa',
          500: '#3b62f6',
          600: '#2545eb',
          700: '#1d34d8',
          800: '#1e2cb0',
          900: '#1e298a',
          950: '#171c54',
        },
        sidebar: {
          bg: '#0f172a',
          hover: '#1e293b',
          active: '#3b82f6',
          text: '#94a3b8',
          textActive: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
