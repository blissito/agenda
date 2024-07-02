import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand_light_gray: "#F8F8F8",
        brand_blue: "#5158F6",
        brand_dark: "#11151A",
      },
    },
  },
  plugins: [],
} satisfies Config;
