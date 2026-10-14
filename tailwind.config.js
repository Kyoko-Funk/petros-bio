/** Tailwind is compiled to assets/css/site.css with `npm run build:css`. */
module.exports = {
  content: ['./*.html', './partials/*.html', './assets/js/*.js'],
  theme: {
    extend: {
      colors: {
        petros: {
          green: '#7A8B69', // sage: decorative, large text, icons
          moss: '#566643', // deep green: small text, buttons (passes contrast)
          deep: '#2F3E30', // forest: dark sections
          night: '#1F2A20',
          mist: '#C5D4B8', // accent on dark backgrounds
          slate: '#2C3E50', // body text
          cream: '#F5F4F0',
          sand: '#ECEAE3',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(47, 62, 48, 0.18)',
        lift: '0 24px 60px -20px rgba(47, 62, 48, 0.35)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { 'float-slow': 'float 9s ease-in-out infinite' },
    },
  },
  plugins: [],
};
