import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { OfflineIndicator } from '../features/PWAInstallButton.jsx';

const AppLayout = () => {
  const navigation = useNavigation();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="cinema-grain min-h-dvh flex flex-col overflow-x-clip w-full max-w-full bg-[#f8f7f4] text-[#141417] dark:bg-[#09090b] dark:text-[#f4f4f6] transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[#d93829] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main
        id="main-content"
        className="w-full max-w-full relative z-10 flex-1 flex flex-col"
      >
        <ErrorBoundary key={location.pathname}>
          {navigation.state === 'loading' ? (
            <div
              role="status"
              aria-label="Loading page"
              className="flex w-full min-h-[60dvh] justify-center items-center"
            >
              <CircularProgress size="3.25rem" sx={{ color: '#d93829' }} />
            </div>
          ) : (
            <Outlet />
          )}
        </ErrorBoundary>
      </main>
      <OfflineIndicator />
      <Footer />
    </div>
  );
};

export default AppLayout;