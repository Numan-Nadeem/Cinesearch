import { createTheme } from '@mui/material';

export function getMuiTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#d93829',
      },
      background: {
        default: isDark ? '#09090b' : '#f8f7f4',
        paper: isDark ? '#121216' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f4f4f6' : '#141417',
        secondary: isDark ? '#a1a1aa' : '#52525b',
      },
    },
    typography: {
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    shape: {
      borderRadius: 12,
    },
  });
}

export const buildMuiTheme = getMuiTheme;

const theme = getMuiTheme('dark');
export default theme;
