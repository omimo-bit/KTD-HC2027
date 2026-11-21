import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        kd: { blue: '#003399', yellow: '#FFD700', red: '#E30613', ink: '#101828', mist: '#F4F7FC' }
      },
      boxShadow: {
        soft: '0 8px 30px rgba(16, 24, 40, 0.06)',
        card: '0 2px 10px rgba(16, 24, 40, 0.04)'
      },
      borderRadius: { '2xl': '1.25rem' }
    }
  },
  plugins: []
};
export default config;
