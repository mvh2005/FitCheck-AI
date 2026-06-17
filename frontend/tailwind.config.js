export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      colors: {
        /* Gen Z dark palette */
        void: '#0A0A0F',
        surface: '#111118',
        card: '#1A1A25',
        border: '#2A2A3A',
        neon: '#A855F7',      /* purple neon */
        neon2: '#06B6D4',     /* cyan neon */
        neon3: '#F97316',     /* orange pop */
        acid: '#84CC16',      /* acid green */
        pink: '#EC4899',      /* hot pink */
        muted: '#6B7280',
        soft: '#9CA3AF',
        bright: '#F9FAFB',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.1) 0%, transparent 60%), radial-gradient(ellipse at 60% 80%, rgba(236,72,153,0.1) 0%, transparent 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(168,85,247,0.05) 0%, rgba(6,182,212,0.03) 100%)',
        'neon-gradient': 'linear-gradient(135deg, #A855F7, #06B6D4)',
        'fire-gradient': 'linear-gradient(135deg, #F97316, #EC4899)',
        'acid-gradient': 'linear-gradient(135deg, #84CC16, #06B6D4)',
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(168,85,247,0.3)',
        'neon-md': '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)',
        'cyan-sm': '0 0 10px rgba(6,182,212,0.3)',
        'pink-sm': '0 0 10px rgba(236,72,153,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(168,85,247,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(168,85,247,0.7), 0 0 50px rgba(168,85,247,0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow': {
          '0%': { textShadow: '0 0 10px rgba(168,85,247,0.5)' },
          '100%': { textShadow: '0 0 20px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.5)' },
        },
      },
    },
  },
  plugins: [],
}
