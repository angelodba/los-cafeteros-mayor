import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './context/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        verdeLima: '#B7F34B',
        verdeOscuro: '#65A61A',
        acentoHero: '#D81E13',
        darkSurface: '#1A1A1A',
        darkBg: '#0f0f0f',
        lightGray: '#f5f5f5',
        offWhite: '#FDFCF7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
