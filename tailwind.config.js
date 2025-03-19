/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // If using the App Router in Next.js
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // If using the App Router in Next.js
  ],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { 'background-position': '200% center' },
          '100%': { 'background-position': '-200% center' },
        },
      },
      animation: {
        shine: 'shine 2s linear infinite',
      },
    },
  },
  plugins: [],
};
