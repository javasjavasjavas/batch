/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F7F2',
        ink: '#151715',
        muted: '#656A61',
        line: '#E3E5DC',
        'line-strong': '#CDD0C4',
        sunken: '#EFEFE8',
        lime: {
          DEFAULT: '#D4F25C',
          strong: '#C3E33F',
          soft: '#F1F8D6',
          ink: '#3E4C0B',
        },
        danger: { DEFAULT: '#B42318', soft: '#FDF0EE' },
        warning: { DEFAULT: '#8A5300', soft: '#FFF5DF' },
        info: { DEFAULT: '#1F4F7A', soft: '#EDF3F8' },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(21,23,21,0.04), 0 6px 20px -12px rgba(21,23,21,0.12)',
        pop: '0 24px 60px -20px rgba(21,23,21,0.35), 0 2px 6px rgba(21,23,21,0.06)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      maxWidth: {
        content: '1320px',
      },
    },
  },
};
