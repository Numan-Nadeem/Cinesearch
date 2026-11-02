import { NavLink, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { List, X } from '@phosphor-icons/react';
import { useWatchlist } from '../../context/WatchlistContext.jsx';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/movies', label: 'Catalogue' },
  { path: '/watchlist', label: 'Watchlist', isWatchlist: true },
  { path: '/about', label: 'Monograph' },
  { path: '/contact', label: 'Dispatch' },
];

const Navbar = () => {
  const [navOptions, setNavOptions] = useState(false);
  const navbarRef = useRef(null);
  const { count } = useWatchlist();

  const handleToggleNavOptions = () => setNavOptions((prev) => !prev);

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
      className="w-full bg-[#f5f2eb] dark:bg-[#0c0c0e] text-[#161514] dark:text-[#f2efe9] transition-colors duration-200"
    >
      {/* Top Bar Contract: 3 zones separated by gap-8, equal outer margins */}
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          aria-label="CineSearch Home"
          className="text-xl font-display font-bold tracking-tight text-[#161514] dark:text-[#f2efe9] hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
        >
          CineSearch
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_LINKS.map(({ path, label, isWatchlist }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#c83a2b] dark:text-[#d94636] font-semibold'
                    : 'text-[#494540] dark:text-[#b5b0a8] hover:text-[#161514] dark:hover:text-[#f2efe9]'
                }`
              }
            >
              <span>{label}</span>
              {isWatchlist && (
                <span
                  data-testid="navbar-watchlist-count"
                  aria-label={`${count} saved titles in watchlist`}
                  className="tabular-nums text-xs text-[#c83a2b] dark:text-[#d94636] font-semibold"
                >
                  · {count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/movies"
            className="hidden sm:inline-flex items-center justify-center bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-4 py-2 text-xs font-semibold text-white transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
          >
            Search Index
          </Link>

          <button
            type="button"
            onClick={handleToggleNavOptions}
            aria-expanded={navOptions}
            aria-controls="mobile-nav-menu"
            aria-label={navOptions ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex md:hidden items-center justify-center w-11 h-11 bg-[#ebe6dc] dark:bg-[#151519] text-[#161514] dark:text-[#f2efe9] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer transition-all duration-150"
          >
            {navOptions ? (
              <X size={20} weight="regular" aria-hidden="true" />
            ) : (
              <List size={20} weight="regular" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {navOptions && (
        <ul
          id="mobile-nav-menu"
          className="flex flex-col bg-[#ebe6dc] dark:bg-[#151519] w-full px-5 py-5 gap-1 md:hidden"
        >
          {NAV_LINKS.map(({ path, label, isWatchlist }) => (
            <li key={path} className="w-full flex">
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `inline-flex items-center justify-between w-full text-base font-medium py-2.5 px-3 ${
                    isActive
                      ? 'bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#c83a2b] dark:text-[#d94636] font-semibold'
                      : 'text-[#161514] dark:text-[#f2efe9]'
                  }`
                }
                onClick={() => setNavOptions(false)}
              >
                <span>{label}</span>
                {isWatchlist && (
                  <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                    {count} saved
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
};

export default Navbar;
