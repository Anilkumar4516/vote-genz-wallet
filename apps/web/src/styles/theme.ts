/**
 * Vote Wallet Design Tokens & Themes
 * Sleek, high-trust dark mode palette with glowing state indicators
 */

export const THEME = {
  colors: {
    background: '#070b14',
    surface: '#101725',
    surfaceLighter: '#151c2c',
    surfaceBorder: '#1e293b',
    primary: '#38bdf8', // Sky blue
    primaryHover: '#0ea5e9',
    accent: '#10b981', // Emerald
    danger: '#f43f5e',
    warning: '#38bdf8', // Sky blue
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    textDark: '#64748b',
  },
  glows: {
    cyan: '0 0 25px -5px rgba(6, 182, 212, 0.4)',
    emerald: '0 0 25px -5px rgba(16, 185, 129, 0.4)',
    danger: '0 0 25px -5px rgba(244, 63, 94, 0.4)',
  },
  typography: {
    fontFamilySans: 'var(--font-outfit), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: 'var(--font-mono), monospace',
  },
} as const;
