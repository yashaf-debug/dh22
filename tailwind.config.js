module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true, screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        accent: "#7B61FF", // яркий фиолетовый
      },
      fontFamily: {
        display: ["Oswald", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: { dh22: "28px" },
      letterSpacing: {
        tightest: "-0.04em",
        tighterish: "-0.03em",
      },
    },
  },
  plugins: [],
}

