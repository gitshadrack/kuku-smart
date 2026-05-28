/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#fbf8ff',
        background: '#fbf8ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f2ff',
        'surface-container': '#ececff',
        'surface-container-high': '#e5e6ff',
        'surface-container-highest': '#dee0ff',
        'on-surface': '#161a32',
        'on-surface-variant': '#404943',
        'on-background': '#161a32',
        primary: '#0f5238',
        'primary-container': '#2d6a4f',
        'primary-fixed': '#b1f0ce',
        'on-primary': '#ffffff',
        'on-primary-container': '#a8e7c5',
        secondary: '#7d5800',
        'secondary-container': '#ffb702',
        'on-secondary-container': '#6b4b00',
        tertiary: '#634019',
        'tertiary-container': '#7e572e',
        error: '#ba1a1a',
        'error-container': '#ffdad6',
        outline: '#707973',
        'outline-variant': '#bfc9c1'
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '9999px'
      },
      spacing: {
        'margin-mobile': '1.25rem',
        'gutter-mobile': '1rem',
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '1.5rem',
        'touch-target': '3rem'
      },
      fontFamily: {
        heading: ['"Work Sans"', 'Arial', 'sans-serif'],
        body: ['"Atkinson Hyperlegible Next"', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
