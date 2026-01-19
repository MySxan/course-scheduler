import daisyuiThemes from "daisyui/theme/object.js";

/** @type {import('tailwindcss').Config} */
export default {
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
        error: {
          50: "#FFF5FA",
          100: "#FFE3F2",
          200: "#FFC2E3",
          300: "#FF93CD",
          400: "#FF5FB2",
          500: "#F83C98",
          DEFAULT: "#E82E86",
          600: "#E82E86",
          700: "#CC2674",
          800: "#AD2163",
          900: "#8B1B50",
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
