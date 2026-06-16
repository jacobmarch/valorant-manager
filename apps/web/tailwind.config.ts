import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#101827',
        ink: '#e5edf7',
        valorant: '#ff4655'
      }
    }
  },
  plugins: []
} satisfies Config;
