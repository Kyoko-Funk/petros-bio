/** Tailwind is compiled to assets/css/site.css with `npm run build:css`. */
module.exports = {
  content: ['./*.html', './partials/*.html', './assets/js/*.js'],
  theme: {
    extend: {
      colors: {
        petros: {
          // Brand palette (brief section 5): blue-grey primary, olive and deep green accents, warm off-white
          blue: '#7E8DA4', // brand blue-grey: accents, large text, decoration
          navy: '#4E5D73', // darker blue-grey for buttons and small text (passes contrast)
          olive: '#708238', // brand olive: icons, hand-drawn strokes
          moss: '#566643', // brand deep green: eyebrows, small accent text
          deep: '#36404D', // dark sections and footer
          night: '#2A323D',
          mist: '#C9D3A6', // soft olive accent on dark backgrounds
          slate: '#2B2F36', // body text (ink)
          cream: '#FAFAF7', // page background
          sand: '#EFEDE6',
          // Hydrotherapy page: warm Scandinavian palette
          linen: '#FAF7F2',
          oat: '#EFE8DD',
          oak: '#8A6A43', // warm accent, passes contrast on linen
          water: '#7E8DA4', // brand blue-grey, decorative
          tide: '#4E5D73', // text and buttons on light backgrounds
          abyss: '#3F4E5F',
          glow: '#F6E7CC',
        },
      },
      fontFamily: {
        serif: ['Belleza', '"Gill Sans"', 'Optima', 'sans-serif'], // headings
        condensed: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'], // labels (fallback for Heartland Sans Condensed)
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(54, 64, 77, 0.18)',
        lift: '0 24px 60px -20px rgba(54, 64, 77, 0.35)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      animation: { 'float-slow': 'float 9s ease-in-out infinite' },
    },
  },
  plugins: [],
};
