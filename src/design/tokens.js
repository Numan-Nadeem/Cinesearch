/**
 * Centralized design system tokens extracted for CineSearch (`impeccable extract`).
 */
export const DESIGN_TOKENS = {
  colors: {
    dark: {
      canvas: '#0c0c0e',
      elevated: '#141418',
      recessed: '#08080a',
      inkPrimary: '#ececef',
      inkSecondary: '#a1a1aa',
      border: 'rgba(255, 255, 255, 0.08)',
    },
    light: {
      canvas: '#f8f7f4',
      elevated: '#ffffff',
      recessed: '#f0eee9',
      inkPrimary: '#141417',
      inkSecondary: '#52525b',
      border: 'rgba(20, 20, 23, 0.10)',
    },
    accent: {
      vermilion: '#d93829',
      vermilionHover: '#b82d20',
      vermilionLight: '#e84a3b',
      gold: '#f59e0b',
      emerald: '#10b981',
    },
  },
  fonts: {
    display: "'Fraunces', Georgia, serif",
    sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
};

export const SURFACE_CLASSES = {
  card: 'rounded-xl bg-white dark:bg-[#141418] border border-zinc-200/80 dark:border-white/[0.08]',
  buttonPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] text-white font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer',
  buttonSecondary:
    'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-white/25 active:scale-[0.98] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer',
};
