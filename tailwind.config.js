/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mathweb: {
          navy: "#0f172a",
          darkblue: "#1e3a8a",
          cobalt: "#2563eb",
          lightcobalt: "#3b82f6",
          violet: "#6366f1",
          emerald: "#059669",
          bg: "#f8fafc",
          surface: "#ffffff",
          border: "#e2e8f0"
        }
      }
    },
  },
  plugins: [],
};
