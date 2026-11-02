import { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Clock, X, Film } from 'lucide-react';
import { Select, MenuItem, FormControl, FormHelperText } from '@mui/material';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useSearchSuggestions } from '../../hooks/useMovieSearch.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { validateReleaseYear } from '../../lib/validation.js';
import SectionKicker from '../ui/SectionKicker.jsx';
import movieBg from '../../assets/images/movie_bg.jpg';

const RECENT_SEARCHES_KEY = 'cinesearch:recent-searches';
const MAX_RECENT_SEARCHES = 8;

/**
 * Editorial Search hero bar with `/` keyboard shortcut focus, one-click clear,
 * debounced autocomplete suggestions (role="combobox"), recent searches history,
 * and accessible labeled Year & Type filters (F1, F5, CS-17, CS-23).
 */
const SearchBar = ({
  initialQuery = '',
  initialYear = '',
  initialType = 'All',
  onSubmitSearch,
  onSelectMovie,
}) => {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [yearInput, setYearInput] = useState(initialYear);
  const [typeInput, setTypeInput] = useState(initialType || 'All');
  const [yearError, setYearError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const [recentSearches, setRecentSearches] = useLocalStorage(RECENT_SEARCHES_KEY, []);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearchInput(initialQuery || '');
    setYearInput(initialYear || '');
    setTypeInput(initialType || 'All');
    setYearError('');
  }, [initialQuery, initialYear, initialType]);

  // Press `/` anywhere outside a form field to focus search (`impeccable delight`)
  useEffect(() => {
    const handleGlobalSlash = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement?.isContentEditable) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', handleGlobalSlash);
    return () => window.removeEventListener('keydown', handleGlobalSlash);
  }, []);

  const debouncedTerm = useDebounce(searchInput, 300);
  const { data: suggestions = [], isFetching: isSuggesting } = useSearchSuggestions(
    debouncedTerm,
    typeInput
  );

  const trimmedInput = searchInput.trim();
  const showSuggestions = dropdownOpen && trimmedInput.length >= 3;
  const safeRecent = Array.isArray(recentSearches) ? recentSearches : [];
  const showRecent = dropdownOpen && trimmedInput.length === 0 && safeRecent.length > 0;

  const activeList = showSuggestions
    ? suggestions
    : showRecent
      ? safeRecent
      : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recordRecentSearch = (term, year, type) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const filtered = list.filter(
        (item) => item.term.toLowerCase() !== clean.toLowerCase()
      );
      return [
        { term: clean, year: year || '', type: type || 'All', timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const triggerSearch = (termToRun, yearToRun = yearInput, typeToRun = typeInput) => {
    const clean = (termToRun || '').trim();
    if (!clean) return;

    const validation = validateReleaseYear(yearToRun);
    if (!validation.valid) {
      setYearError(validation.error);
      return;
    }
    setYearError('');
    setDropdownOpen(false);
    setActiveIndex(-1);
    recordRecentSearch(clean, yearToRun, typeToRun);
    onSubmitSearch({
      query: clean,
      year: String(yearToRun || '').trim(),
      type: typeToRun || 'All',
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    triggerSearch(searchInput, yearInput, typeInput);
  };

  const handleKeyDown = (e) => {
    if (!dropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setDropdownOpen(true);
      return;
    }

    if (e.key === 'Escape') {
      setDropdownOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (activeList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % activeList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + activeList.length) % activeList.length);
    } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < activeList.length) {
      e.preventDefault();
      const item = activeList[activeIndex];
      if (showSuggestions) {
        setSearchInput(item.Title);
        triggerSearch(item.Title, yearInput, typeInput);
      } else if (showRecent) {
        setSearchInput(item.term);
        setYearInput(item.year || '');
        setTypeInput(item.type || 'All');
        triggerSearch(item.term, item.year || '', item.type || 'All');
      }
    }
  };

  return (
    <section
      aria-label="Search movies and TV shows"
      className="relative min-h-[24rem] pt-12 pb-14 bg-cover bg-center border-b border-zinc-200/80 dark:border-white/[0.08] bg-[#0c0c0e] flex items-center"
      style={{ backgroundImage: `url(${movieBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e]/85 via-[#0c0c0e]/75 to-[#0c0c0e] z-0" />

      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-4xl mx-auto flex flex-col gap-5 justify-center items-center z-10 relative px-6 max-sm:gap-3.5"
      >
        <div className="text-center">
          <SectionKicker index="01" className="mb-2 !text-[#e84a3b]">
            Catalogue Index &amp; Archive
          </SectionKicker>
          <h1 className="font-display text-white text-3xl sm:text-5xl font-bold tracking-tight">
            Find your next favorite film
          </h1>
        </div>

        <div ref={containerRef} className="w-full flex justify-center gap-2.5 relative mt-1">
          <div className="relative w-full sm:w-[76%]">
            <label htmlFor="movie-search-input" className="sr-only">
              Search by movie or series title
            </label>
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              aria-hidden="true"
            >
              <FiSearch size={18} />
            </span>

            <input
              ref={inputRef}
              id="movie-search-input"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={Boolean(showSuggestions || showRecent)}
              aria-controls="search-suggestions-listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
              }
              value={searchInput}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setDropdownOpen(true);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search titles, directors, or genres (e.g. Batman, Alien, Dune)..."
              className="pl-11 pr-12 py-3.5 text-white bg-[#141418]/95 border border-white/15 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#d93829] transition-all text-sm sm:text-base placeholder:text-zinc-400 shadow-lg [&::-webkit-search-cancel-button]:hidden"
            />

            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setDropdownOpen(true);
                  inputRef.current?.focus();
                }}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : (
              <kbd
                aria-hidden="true"
                title="Press / to focus search"
                className="hidden sm:inline-flex items-center justify-center absolute right-3.5 top-1/2 -translate-y-1/2 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400 pointer-events-none"
              >
                /
              </kbd>
            )}

            <div className="sr-only" aria-live="polite">
              {showSuggestions
                ? `${suggestions.length} suggestions available.`
                : ''}
            </div>

            {(showSuggestions || showRecent) && (
              <div
                id="search-suggestions-listbox"
                role="listbox"
                aria-label={showSuggestions ? 'Title suggestions' : 'Recent searches'}
                className="absolute left-0 right-0 top-full mt-2 z-40 rounded-xl bg-[#141418] border border-white/15 shadow-2xl overflow-hidden text-white max-h-80 overflow-y-auto"
              >
                {showSuggestions && (
                  <>
                    <div className="px-4 py-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400 bg-black/50 flex justify-between items-center">
                      <span>Suggestions</span>
                      {isSuggesting && <span>Searching...</span>}
                    </div>
                    {suggestions.length > 0 ? (
                      suggestions.map((item, idx) => (
                        <div
                          key={item.imdbID}
                          id={`search-option-${idx}`}
                          role="option"
                          aria-selected={activeIndex === idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchInput(item.Title);
                            triggerSearch(item.Title, yearInput, typeInput);
                          }}
                          className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                            activeIndex === idx
                              ? 'bg-[#d93829]/25 text-white'
                              : 'hover:bg-white/[0.06] text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Film className="w-4 h-4 text-[#e84a3b] shrink-0" aria-hidden="true" />
                            <span className="font-medium truncate">{item.Title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs font-mono tabular-nums text-zinc-400">
                            <span className="capitalize font-sans">{item.Type}</span>
                            <span>·</span>
                            <span>{item.Year}</span>
                            {onSelectMovie && (
                              <button
                                type="button"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setDropdownOpen(false);
                                  onSelectMovie(item.imdbID);
                                }}
                                className="ml-1 rounded bg-white/10 px-2 py-0.5 text-[11px] font-sans text-white hover:bg-[#d93829] transition-colors cursor-pointer"
                              >
                                Details
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : !isSuggesting ? (
                      <div className="px-4 py-3 text-xs text-zinc-400">
                        Press Enter to search for &ldquo;{trimmedInput}&rdquo;
                      </div>
                    ) : null}
                  </>
                )}

                {showRecent && (
                  <>
                    <div className="px-4 py-2 text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400 bg-black/50 flex justify-between items-center">
                      <span>Recent Searches</span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setRecentSearches([]);
                        }}
                        className="text-[#e84a3b] hover:underline cursor-pointer text-[11px] font-sans"
                      >
                        Clear all
                      </button>
                    </div>
                    {safeRecent.map((item, idx) => (
                      <div
                        key={`${item.term}-${idx}`}
                        id={`search-option-${idx}`}
                        role="option"
                        aria-selected={activeIndex === idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSearchInput(item.term);
                          setYearInput(item.year || '');
                          setTypeInput(item.type || 'All');
                          triggerSearch(item.term, item.year || '', item.type || 'All');
                        }}
                        className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          activeIndex === idx
                            ? 'bg-[#d93829]/25 text-white'
                            : 'hover:bg-white/[0.06] text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Clock className="w-4 h-4 text-zinc-400 shrink-0" aria-hidden="true" />
                          <span className="font-medium truncate">{item.term}</span>
                          {(item.year || (item.type && item.type !== 'All')) && (
                            <span className="text-xs font-mono tabular-nums text-zinc-400">
                              ({[item.year, item.type !== 'All' ? item.type : null].filter(Boolean).join(' · ')})
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.term} from recent searches`}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRecentSearches((prev) =>
                              (Array.isArray(prev) ? prev : []).filter((_, i) => i !== idx)
                            );
                          }}
                          className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-7 py-3.5 bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] text-white cursor-pointer rounded-xl font-semibold shadow-lg transition-all duration-200 max-sm:hidden focus:outline-none focus:ring-2 focus:ring-[#d93829]"
          >
            Search
          </button>
        </div>

        {/* Accessible Labeled Filter Controls (CS-17, CS-23) */}
        <div className="flex flex-wrap items-end justify-center gap-4 max-sm:w-full max-sm:gap-2">
          <FormControl error={Boolean(yearError)} className="w-44 max-sm:w-[48%]" variant="standard">
            <label
              htmlFor="release-year-input"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Release Year
            </label>
            <input
              id="release-year-input"
              type="number"
              min="1880"
              max={new Date().getFullYear()}
              value={yearInput}
              onChange={(e) => {
                const val = e.target.value.slice(0, 4);
                setYearInput(val);
                const check = validateReleaseYear(val);
                setYearError(check.valid ? '' : check.error);
              }}
              placeholder="Any Year (e.g. 2008)"
              className="w-full h-11 px-3.5 font-mono tabular-nums text-sm text-white bg-[#141418]/95 border border-white/15 rounded-xl placeholder:font-sans placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#d93829] transition-all
                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
            />
          </FormControl>

          <div className="w-44 max-sm:w-[48%]">
            <label
              id="content-type-label"
              htmlFor="content-type-select"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              Content Type
            </label>
            <Select
              id="content-type-select"
              labelId="content-type-label"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Content Type' }}
              sx={{
                width: '100%',
                height: '44px',
                color: 'white',
                backgroundColor: 'rgba(20, 20, 24, 0.95)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                border: '1px solid rgba(255,255,255,0.15)',
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="movie">Movies</MenuItem>
              <MenuItem value="series">TV Series</MenuItem>
              <MenuItem value="episode">Episodes</MenuItem>
            </Select>
          </div>
        </div>

        <FormHelperText
          role={yearError ? 'alert' : undefined}
          className={`transition-all duration-300 overflow-hidden ${
            yearError
              ? 'opacity-100 max-h-12 mt-1 text-white! bg-[#d93829] px-3.5 py-1.5 rounded-lg text-xs font-medium'
              : 'opacity-0 max-h-0 mt-0'
          }`}
        >
          {yearError}
        </FormHelperText>

        <button
          type="submit"
          className="hidden max-sm:block py-3 w-full bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] text-white cursor-pointer rounded-xl font-semibold transition-all duration-200 mt-1"
        >
          Search
        </button>
      </form>
    </section>
  );
};

export default SearchBar;
