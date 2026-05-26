/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        anchor: {
          50: "#f7f6f3",
          100: "#edeae3",
          200: "#d9d4c8",
          300: "#c0b8a6",
          400: "#a89982",
          500: "#8f7f68",
          600: "#7a6b57",
          700: "#645748",
          800: "#54493d",
          900: "#483f36",
          950: "#27211c",
        },
        sage: {
          50: "#f4f7f4",
          100: "#e3ebe3",
          200: "#c8d7c9",
          300: "#a3bba5",
          400: "#7a9a7d",
          500: "#5a7d5e",
          600: "#466449",
          700: "#39503c",
          800: "#304233",
          900: "#29372b",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      animation: {
        "breath-in": "breath-in 4s ease-in-out infinite",
        "breath-out": "breath-out 4s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "breath-in": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        "breath-out": {
          "0%, 100%": { transform: "scale(1.15)", opacity: "1" },
          "50%": { transform: "scale(1)", opacity: "0.6" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
