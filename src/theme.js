import { createTheme } from '@mui/material';

export function getMuiTheme(mode = 'dark') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: '#c83a2b',
      },
      background: {
        default: isDark ? '#0c0c0e' : '#f7f4ee',
        paper: isDark ? '#131317' : '#fcfbf8',
      },
      text: {
        primary: isDark ? '#f2efe9' : '#181615',
        secondary: isDark ? '#a8a29e' : '#57534e',
      },
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    shape: {
      borderRadius: 10,
    },
  });
}

export const buildMuiTheme = getMuiTheme;

const theme = getMuiTheme('dark');
export default theme;
