import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getMuiTheme } from '../theme.js';

const ThemeContext = createContext(null);

const THEME_MODES = ['dark', 'light', 'system'];

export function AppThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useLocalStorage('cinesearch:theme', 'dark');
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedMode = useMemo(() => {
    if (themePreference === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return themePreference === 'light' ? 'light' : 'dark';
  }, [themePreference, systemPrefersDark]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedMode);
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode]);

  const cycleTheme = useCallback(() => {
    setThemePreference((prev) => {
      const idx = THEME_MODES.indexOf(prev);
      const nextIdx = (idx + 1) % THEME_MODES.length;
      return THEME_MODES[nextIdx];
    });
  }, [setThemePreference]);

  const muiTheme = useMemo(() => getMuiTheme(resolvedMode), [resolvedMode]);

  const value = useMemo(
    () => ({
      themePreference,
      resolvedMode,
      setThemePreference,
      cycleTheme,
    }),
    [themePreference, resolvedMode, setThemePreference, cycleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
}
