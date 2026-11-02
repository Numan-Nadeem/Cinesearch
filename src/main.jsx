import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import '@fontsource/poppins';
import App from './App.jsx';
import { queryClient, initQueryCachePersistence } from './lib/queryClient.js';
import { AppThemeProvider } from './context/ThemeContext.jsx';
import { WatchlistProvider } from './context/WatchlistContext.jsx';

initQueryCachePersistence(queryClient);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <WatchlistProvider>
          <App />
        </WatchlistProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
