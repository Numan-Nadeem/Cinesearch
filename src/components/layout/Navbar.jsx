import { NavLink, Link } from 'react-router-dom';
import { MdTheaters } from 'react-icons/md';
import { GiHamburgerMenu } from 'react-icons/gi';
import { RxCross2 } from 'react-icons/rx';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import { PWAInstallButton } from '../features/PWAInstallButton.jsx';
import { useActiveProvider } from '../../hooks/useMovieSearch.js';
import { setActiveProviderId } from '../../api/provider.js';

const navVariants = {
  open: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
    opacity: 1,
    height: 'auto',
  },
  closed: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
    opacity: 0,
    height: 0,
  },
};

const itemVariants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -10 },
};

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/movies', label: 'Catalogue' },
  { path: '/watchlist', label: 'Watchlist', isWatchlist: true },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [navOptions, setNavOptions] = useState(false);
  const navbarRef = useRef(null);
  const { count } = useWatchlist();
  const providerId = useActiveProvider();

  const handleToggleNavOptions = () => setNavOptions((prev) => !prev);

  const handleToggleProvider = () => {
    const next = providerId === 'omdb' ? 'tmdb' : 'omdb';
    setActiveProviderId(next);
  };

  useEffect(() => {
    if (!navOptions) return;

    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setNavOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navOptions]);

  return (
    <header
      ref={navbarRef}
      className="sticky top-0 z-50 px-4 pt-3 pb-2 md:px-8 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-[#f8f7f4]/85 dark:bg-[#111115]/80 backdrop-blur-2xl shadow-lg px-5 py-3 flex items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="CineSearch Home"
          className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-zinc-900 dark:text-white hover:text-[#d93829] dark:hover:text-[#e84a3b] transition-colors duration-200"
        >
          <MdTheaters size={24} className="text-[#d93829]" aria-hidden="true" />
          <span className="font-display text-xl font-extrabold tracking-tight">
            CineSearch
          </span>
        </Link>

        {/* Desktop Split Glass Navigation */}
        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 rounded-full bg-zinc-200/60 dark:bg-white/[0.04] border border-zinc-300/60 dark:border-white/[0.06] px-2 py-1">
          {NAV_LINKS.map(({ path, label, isWatchlist }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.08em] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#d93829] text-white shadow-sm'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white'
                }`
              }
            >
              <span>{label}</span>
              {isWatchlist && (
                <span
                  data-testid="navbar-watchlist-count"
                  aria-label={`${count} saved titles in watchlist`}
                  className="font-mono tabular-nums text-[11px] opacity-90"
                >
                  ({count})
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Action Controls: Provider Switcher (F8), PWA Install (F7), Theme Toggle (F6), Mobile Menu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleProvider}
            aria-label={`Catalogue Provider: ${providerId.toUpperCase()} (click to switch)`}
            title={`Active Data Adapter: ${providerId.toUpperCase()} — Click to toggle between OMDb and TMDB`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300/80 dark:border-white/15 bg-white dark:bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-white hover:border-[#d93829] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer transition-all duration-200"
          >
            <Database className="w-3.5 h-3.5 text-[#d93829]" aria-hidden="true" />
            <span className="font-mono uppercase tracking-wider text-[11px]">{providerId}</span>
          </button>

          <PWAInstallButton />
          <ThemeToggle />

          <button
            type="button"
            onClick={handleToggleNavOptions}
            aria-expanded={navOptions}
            aria-controls="mobile-nav-menu"
            aria-label={navOptions ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex md:hidden items-center justify-center p-2 rounded-xl text-zinc-900 dark:text-white hover:bg-zinc-200/70 dark:hover:bg-white/10 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer transition-all duration-200"
          >
            {!navOptions ? (
              <GiHamburgerMenu size={20} aria-hidden="true" />
            ) : (
              <RxCross2 size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {navOptions && (
          <motion.ul
            id="mobile-nav-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={navVariants}
            className="flex flex-col bg-[#f8f7f4] dark:bg-[#141418] w-[calc(100%-2rem)] mx-auto mt-2 rounded-2xl px-6 py-5 gap-3.5 md:hidden border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            {NAV_LINKS.map(({ path, label, isWatchlist }) => (
              <motion.li
                key={path}
                variants={itemVariants}
                className="w-full flex"
              >
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `inline-flex items-center justify-between w-full text-base font-semibold py-1.5 border-b border-zinc-200/50 dark:border-white/5 ${
                      isActive
                        ? 'text-[#d93829] dark:text-[#e84a3b]'
                        : 'text-zinc-800 dark:text-zinc-200'
                    }`
                  }
                  onClick={() => setNavOptions(false)}
                >
                  <span>{label}</span>
                  {isWatchlist && (
                    <span className="font-mono tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
                      {count} saved
                    </span>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
