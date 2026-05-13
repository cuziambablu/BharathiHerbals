import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors — use "brand-emerald" to avoid conflicting with Tailwind's emerald scale
        "brand-emerald": "#0B3D2E",
        gold: {
          DEFAULT: "#C8A96B",
        },
        forest: {
          DEFAULT: "#071A13",
        },
        brown: {
          DEFAULT: "#2B1810",
        },
        cream: {
          DEFAULT: "#F6F1E7",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)"],
        serif: ["var(--font-cormorant)"],
        cormorant: ["var(--font-cormorant)"],
        poppins: ["var(--font-poppins)"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
