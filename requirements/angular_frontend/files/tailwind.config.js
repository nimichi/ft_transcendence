/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  safelist: ['bg-blue-400', 'bg-green-400', 'bg-red-400'],
  theme: {
    extend: {
      margin: {
        '50': '7rem', // Füge eine neue Klasse mit größerem Abstand hinzu
      },
      spacing: {
        '30': '7.5rem', // Füge einen neuen Abstandswert hinzu
      },
    },
  },
  plugins: [],
}

