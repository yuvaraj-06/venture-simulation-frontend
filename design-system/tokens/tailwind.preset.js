/**
 * Share Ventures Design System — Tailwind preset 3.0.0
 * Mirrors tokens.css (canonical). Usage:
 *
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require('./design-system/tokens/tailwind.preset')],
 *     content: ['./src/**\/*.{html,js,jsx,ts,tsx}'],
 *   }
 */
module.exports = {
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      white: '#ffffff',
      'off-white': '#e8e6e4',
      'home-bg': '#f1f4f5',
      gray: {
        light: '#c8cbcc',
        mid: '#939799',
        dark: '#5e6366',
        xdark: '#2b3033',
      },
      // CTA green — interactive elements only. Never decoration, never the logo.
      green: '#00d65d',
    },
    fontFamily: {
      sans: ['var(--font-aeonik, "Aeonik Pro")', 'Aeonik', 'Arial', '"Helvetica Neue"', 'Helvetica', 'sans-serif'],
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      bold: '700',
      black: '900',
    },
    extend: {
      fontSize: {
        display: ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '400' }],
        h1: ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '500' }],
        h2: ['clamp(2rem, 3.5vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '500' }],
        h3: ['1.75rem', { lineHeight: '1.15', fontWeight: '500' }],
        h4: ['1.25rem', { lineHeight: '1.3', fontWeight: '400' }],
        intro: ['1.5rem', { lineHeight: '1.35', fontWeight: '400' }],
        body: ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.8125rem', { lineHeight: '1.45', fontWeight: '400' }],
        stat: ['clamp(4rem, 10vw, 8rem)', { lineHeight: '1', fontWeight: '400' }],
      },
      spacing: {
        // 4px base scale — matches --sv-space-*
        1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px',
        12: '48px', 16: '64px', 24: '96px', 32: '128px', 48: '192px',
      },
      maxWidth: {
        container: '1440px',
        rail: '288px',
        measure: '70ch',
      },
      borderRadius: {
        // The brand is sharp-cornered. DEFAULT stays 0; nothing else is defined.
        none: '0',
        DEFAULT: '0',
      },
      transitionTimingFunction: {
        'sv-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'sv-inout': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      transitionDuration: {
        instant: '100ms',
        fast: '200ms',
        base: '300ms',
        slow: '600ms',
        cine: '1000ms',
      },
      zIndex: {
        nav: '100',
        overlay: '200',
        modal: '300',
      },
    },
  },
}
