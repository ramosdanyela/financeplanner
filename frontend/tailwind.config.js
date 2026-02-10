/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-main': '#1A1A1A',
        'bg-sidebar': '#212121',
        'bg-card': '#2C2C34',
        'bg-nav-active': '#3F3F4D',
        'bg-nav-hover': '#353540',

        // Text
        'text-primary': '#E0E0E0',
        'text-secondary': '#A0A0A0',
        'text-link': '#BB86FC',
        'text-income': '#4CAF50',
        'text-outcome': '#FF5252',

        // Accents
        'accent-primary': '#FF4D4D',
        'accent-purple': '#BB86FC',
        'accent-orange': '#FF9800',
        'accent-amber': '#E9C46A',
        'accent-blue': '#3498DB',

        // UI Elements
        'progress-track': '#404048',
        'border-subtle': '#3A3A42',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'balance': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h1': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h2': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'nav': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'item-title': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '40px',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
    },
  },
  plugins: [],
};
