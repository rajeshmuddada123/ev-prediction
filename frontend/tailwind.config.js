/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ev: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          cardBorder: "#E2E8F0",
          panel: "#F1F5F9",
          teal: "#0D9488",
          tealLight: "#14B8A6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
          blue: "#3B82F6",
          darkNavy: "#0F172A",
          slateText: "#334155"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
