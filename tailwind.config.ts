import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5B4FCF",
          light: "#EEEDFE",
          dark: "#3C3489",
        },
        success: "#1D9E75",
        warning: "#BA7517",
        danger: "#C0392B",
        surface: "#FFFFFF",
        bg: "#F7F7F5",
        text: {
          primary: "#1A1A1A",
          secondary: "#6B6B6B",
          tertiary: "#A0A0A0",
        },
        pillar: {
          celebrations: "#D4537E",
          school: "#5B4FCF",
          vacations: "#1D9E75",
          household: "#BA7517",
          kids: "#D85A30",
        },
      },
      fontFamily: {
        sans: ["SF Pro Display", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        input: "8px",
        card: "12px",
        modal: "16px",
        sheet: "24px",
        pill: "99px",
      },
      maxWidth: {
        app: "480px",
      },
      boxShadow: {
        float: "0 1px 3px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
