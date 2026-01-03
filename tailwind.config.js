/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: '#ADEBB3',
        accent: '#D3AF37',

        // Background colors
        background: '#F6FBF8',
        card: '#FFFFFF',

        // Text colors
        'text-primary': '#1F2D2A',
        'text-secondary': '#6B7C77',

        // Utility colors
        divider: '#E3EFE8',
        warning: '#F5C16C',
        error: '#E58C8C',
        success: '#7FC8A9',

        // Chart palette
        chart: {
          1: '#ADEBB3',
          2: '#7FC8A9',
          3: '#A3D9D3',
          4: '#F5C16C',
          5: '#E8B4BC',
          6: '#C3B1E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
      },
      lineHeight: {
        relaxed: '1.6',
        snug: '1.4',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(31, 45, 42, 0.06)',
        'softer': '0 1px 4px rgba(31, 45, 42, 0.04)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
