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
        background: '#FEFCFA',
        card: '#FFFFFF',
        cardAlt: '#F8F3EE',
        primary: '#5A3E2B',
        primaryLight: '#876552',
        accent: '#BE8A68',
        accentLight: '#EDD9C8',
        rose: '#B87484',
        roseLight: '#F4E4E8',
        prev: '#E5D8CD',
        prevText: '#7D6554',
        current: '#5A3E2B',
        warning: '#CB6F51',
        success: '#4C8B62',
        muted: '#AA9B93',
        border: '#E8E0D7',
        text: '#2A1A0E',
        textLight: '#7B6A5E',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-jp)', 'sans-serif'],
        serif: ['var(--font-noto-serif-jp)', 'serif'],
      },
      boxShadow: {
        'card': '0 1px 4px rgba(90,62,43,0.06), 0 4px 16px rgba(90,62,43,0.06)',
        'card-hover': '0 2px 8px rgba(90,62,43,0.10), 0 8px 24px rgba(90,62,43,0.08)',
        'header': '0 1px 0 #E8E0D7, 0 2px 12px rgba(90,62,43,0.06)',
        'footer': '0 -1px 0 #E8E0D7, 0 -4px 16px rgba(90,62,43,0.06)',
        'btn': '0 1px 3px rgba(90,62,43,0.20)',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '20px',
        '3xl': '28px',
      },
    },
  },
  plugins: [],
};
export default config;
