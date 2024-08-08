import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand_light_gray: "#F8F8F8",
        brand_blue: "#5158F6",
        brand_dark: "#11151A",
        brand_yellow: "#FFD75E",
        brand_gray: "#4B5563",
        brand_pale: "#F0F0F0",
        brand_ash: "#E3E2E2",
        brand_iron: "#8391A1",
        brand_stroke: "#F2F2F2",
        brand_switch_inactive: "#EFEFF0",
      },
      backgroundImage: {
        calendar: "url(/images/calendarPattern.svg)",
        banner: "url(/images/back-banner.png)",
        schedule: "url(/images/schedule.png)",
      },
      animation: {
        "meteor-effect": "meteor 5s linear infinite",
        "vibration-effect": "vibration .5s ease",
        "movement-effect": "movement .5s ease",
      },
      keyframes: {
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
        movement: {
          "0%": { transform: "rotate(1deg)" },
          "25%": { transform: "rotate(-1deg)" },
          "50%": { transform: "rotate(1deg)" },
          "75%": { transform: "rotate(-1deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        vibration: {
          "0%": { transform: "rotate(10deg)" },
          "25%": { transform: "rotate(-10deg)" },
          "50%": { transform: "rotate(10deg)" },
          "75%": { transform: "rotate(-10deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
