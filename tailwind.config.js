/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: "#FAF9F5",
        bgSecondary: "#F5F4F0",
        bgCard: "#FFFFFF",
        borderCard: "#E3E2DF",
        accentPrimary: "#F7A8C4",
        accentSecondary: "#F5C842",
        textPrimary: "#1B1C1A",
        textSecondary: "#444748",
        statusCritical: "#EF4444",
        statusWarning: "#F59E0B",
        statusGood: "#10B981",
        // New brand names matching templates
        "brand-bg": "#FAF9F5",
        "brand-sidebar": "#1A1A1A",
        "brand-yellow": "#F5C842",
        "brand-pink": "#F7A8C4",
        "brand-green": "#B5C43A",
        "brand-blue": "#A8D4F5",
        "brand-pill-bg": "#FFFFFF",
        "brand-pink-light": "#FFDCE6",
      },
      borderRadius: {
        card: "24px",
      },
      spacing: {
        gutter: "24px",
        "stack-gap": "12px",
        "sidebar-width": "220px",
        "margin-page": "32px",
        "card-padding": "24px"
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
      }
    },
  },
  plugins: [],
}
