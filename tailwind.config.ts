import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./Front/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        card: '#FFFFFF',
        cardAlt: '#F5F0EB',
        primary: '#6B4F3A',
        primaryLight: '#9B7B65',
        accent: '#C4937A',
        accentLight: '#E8C9B8',
        rose: '#B5838D',
        roseLight: '#E8D5D8',
        prev: '#D4C4B8',
        prevText: '#8B7355',
        current: '#6B4F3A',
        warning: '#D4836B',
        success: '#7A9E7E',
        muted: '#9E9189',
        border: '#E8DDD5',
        text: '#3D2B1F',
        textLight: '#7A6A5F',
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
