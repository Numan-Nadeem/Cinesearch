import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import { OfflineIndicator } from '../features/PWAInstallButton.jsx';
import { ResultGridSkeleton } from '../ui/Skeleton.jsx';
import { useSmoothScroll } from '../../hooks/useSmoothScroll.js';

const AppLayout = () => {
  const navigation = useNavigation();
  const location = useLocation();

  useSmoothScroll();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="cinema-grain relative min-h-dvh flex flex-col overflow-x-clip w-full max-w-full bg-[#f7f4ee] text-[#181615] dark:bg-[#0c0c0e] dark:text-[#f2efe9] transition-colors duration-200">
      {/* Fixed pointer-events-none SVG celluloid grain overlay to break digital flatness */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 h-full w-full opacity-[0.028] dark:opacity-[0.042] mix-blend-overlay"
      >
        <filter id="cinesearch-film-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#cinesearch-film-noise)" />
      </svg>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-[#c83a2b] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:text-white focus:shadow-xl focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <main
        id="main-content"
        className="overflow-x-hidden w-full max-w-full relative z-10 flex-1 flex flex-col"
      >
        <ErrorBoundary key={location.pathname}>
          {navigation.state === 'loading' ? (
            <div
              role="status"
              aria-label="Loading archival record"
              className="w-full py-12"
            >
              <ResultGridSkeleton count={4} />
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