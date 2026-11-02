/**
 * Centralized design system tokens for CineSearch Archival Monograph & Repertory Index.
 */
export const DESIGN_TOKENS = {
  colors: {
    dark: {
      canvas: '#0c0c0e',
      elevated: '#131317',
      recessed: '#08080a',
      inkPrimary: '#f2efe9',
      inkSecondary: '#a8a29e',
      border: 'rgba(242, 239, 233, 0.09)',
    },
    light: {
      canvas: '#f7f4ee',
      elevated: '#fcfbf8',
      recessed: '#ede8df',
      inkPrimary: '#181615',
      inkSecondary: '#57534e',
      border: 'rgba(28, 25, 23, 0.11)',
    },
    accent: {
      vermilion: '#c83a2b',
      vermilionHover: '#a92e21',
      vermilionLight: '#d94636',
      gold: '#b87d24',
    },
  },
  fonts: {
    display: "'Fraunces', Georgia, serif",
    sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
};

export const SURFACE_CLASSES = {
  card: 'rounded-xl bg-[#fcfbf8] dark:bg-[#131317] border border-stone-300/75 dark:border-white/[0.08]',
  buttonPrimary:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] text-white font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer whitespace-nowrap shrink-0',
  buttonSecondary:
    'inline-flex items-center justify-center gap-2 rounded-lg border border-stone-300/90 dark:border-white/12 bg-[#fcfbf8] dark:bg-[#131317] text-stone-800 dark:text-stone-200 hover:border-[#c83a2b] dark:hover:border-[#d94636] active:scale-[0.98] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer whitespace-nowrap shrink-0',
};
