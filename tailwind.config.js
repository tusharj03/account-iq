/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // IBM Carbon palette
        ibm: {
          blue: '#0f62fe',
          blueHover: '#0353e9',
          blueDark: '#002d9c',
          cyan: '#1192e8',
          green: '#24a148',
          amber: '#f1c21b',
          red: '#da1e28',
          purple: '#8a3ffc',
        },
        gray: {
          10: '#f4f4f4',
          20: '#e0e0e0',
          30: '#c6c6c6',
          40: '#a8a8a8',
          50: '#8d8d8d',
          60: '#6f6f6f',
          70: '#525252',
          80: '#393939',
          90: '#262626',
          100: '#161616',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1180px',
      },
    },
  },
  plugins: [],
};
