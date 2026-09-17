/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: {
          background: "#0f0f0f",
          surface: "#181818",
          card: "#1f1f1f",
          hover: "#272727",
        }
      },
    },
  },
  plugins: [],
};
