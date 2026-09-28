/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        elder: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#0F172A',
          subtext: '#334155',
          border: '#CBD5E1',
          primary: '#1E40AF',     // Dark royal blue for high contrast
          primaryHover: '#1D4ED8',
          success: '#166534',     // Dark green
          danger: '#991B1B',      // Dark red
          accent: '#D97706',      // Dark amber
        },
        // Ultra High-Contrast Palette for Visually Impaired (Yellow on Black / Pure White)
        highcontrast: {
          bg: '#000000',
          card: '#121212',
          text: '#FFFF00',        // Bright accessible yellow
          subtext: '#FFFFFF',     // Pure white
          border: '#FFFF00',      // Yellow border
          primary: '#FFFF00',
          primaryText: '#000000',
          userBubble: '#002B49',
          botBubble: '#1F2937',
        }
      },
      fontSize: {
        'elder-sm': ['1rem', { lineHeight: '1.5rem' }],        // 16px
        'elder-base': ['1.125rem', { lineHeight: '1.75rem' }], // 18px (minimum standard base)
        'elder-lg': ['1.25rem', { lineHeight: '1.875rem' }],   // 20px
        'elder-xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
        'elder-2xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
        'elder-3xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
      },
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-recording': 'recording 1.2s ease-in-out infinite',
      },
      keyframes: {
        recording: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 0 14px rgba(239, 68, 68, 0)' },
        }
      }
    },
  },
  plugins: [],
}
