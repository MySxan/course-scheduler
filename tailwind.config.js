/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          DEFAULT: "#0D9488",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["cupcake"],
    darkTheme: "cupcake",
    base: true,
    styled: true,
    utils: true,
    logs: true,
  },
};
