import { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlass,
  ClockCounterClockwise,
  X,
  FilmStrip,
  CaretDown,
  WarningCircle,
} from '@phosphor-icons/react';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useSearchSuggestions } from '../../hooks/useMovieSearch.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { validateReleaseYear } from '../../lib/validation.js';

const RECENT_SEARCHES_KEY = 'cinesearch:recent-searches';
const MAX_RECENT_SEARCHES = 8;

/**
 * Editorial Search Workbench header with `/` keyboard shortcut focus, one-click clear,
 * debounced autocomplete suggestions (role="combobox"), recent searches history,
 * and native accessible Year & Type filters.
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

  // Press `/` anywhere outside a form field to focus search
  useEffect(() => {
    const handleGlobalSlash = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        document.activeElement?.isContentEditable
      ) {
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
      className="py-14 md:py-20 bg-[#ebe6dc] dark:bg-[#151519] transition-colors"
    >
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-[1360px] mx-auto flex flex-col gap-8 px-5 sm:px-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-display text-[#161514] dark:text-white text-3xl sm:text-5xl font-bold tracking-[-0.03em] leading-[1.02]">
              Search the film index.
            </h1>
          </div>
          <div className="lg:col-span-5 flex flex-col lg:items-end justify-end">
            <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
              Query OMDb and TMDB by title, director, release year (1880–present), or format. Press{' '}
              <kbd className="bg-[#f5f2eb] dark:bg-[#0c0c0e] px-1.5 py-0.5 text-xs font-semibold text-[#161514] dark:text-white">
                /
              </kbd>{' '}
              to focus.
            </p>
          </div>
        </div>

        {/* Main Combobox & Filter Bar */}
        <div
          ref={containerRef}
          data-ui="search-workbench"
          className="bg-[#e2dcd0] dark:bg-[#1d1d23] p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-end relative"
        >
          {/* Primary Title / Director Input (6 cols on desktop) */}
          <div className="md:col-span-6 relative">
            <label
              htmlFor="movie-search-input"
              className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
            >
              Title, Director, or Keyword
            </label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b655e] pointer-events-none"
                aria-hidden="true"
              >
                <MagnifyingGlass size={18} />
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
                className="h-11 pl-10 pr-10 text-[#161514] dark:text-white bg-[#f5f2eb] dark:bg-[#0c0c0e] w-full focus:outline-none focus:ring-2 focus:ring-[#c83a2b] transition-all text-sm placeholder:text-[#6b655e] [&::-webkit-search-cancel-button]:hidden"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setDropdownOpen(true);
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6b655e] hover:text-[#161514] dark:hover:text-white hover:bg-[#ebe6dc] dark:hover:bg-[#151519] cursor-pointer transition-colors"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="sr-only" aria-live="polite">
              {showSuggestions
                ? `${suggestions.length} suggestions available.`
                : ''}
            </div>

            {/* Suggestions & Recent Searches Listbox */}
            {(showSuggestions || showRecent) && (
              <div
                id="search-suggestions-listbox"
                role="listbox"
                aria-label={showSuggestions ? 'Title suggestions' : 'Recent searches'}
                className="absolute left-0 right-0 top-full mt-2 z-40 bg-[#f5f2eb] dark:bg-[#151519] shadow-2xl overflow-hidden text-[#161514] dark:text-white max-h-80 overflow-y-auto"
              >
                {showSuggestions && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] bg-[#ebe6dc] dark:bg-[#1d1d23] flex justify-between items-center">
                      <span>Index suggestions</span>
                      {isSuggesting && <span className="tabular-nums text-[11px]">Querying...</span>}
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
                              ? 'bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#161514] dark:text-white'
                              : 'hover:bg-[#ebe6dc] dark:hover:bg-[#1d1d23] text-[#161514] dark:text-[#f2efe9]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <FilmStrip
                              size={16}
                              weight="duotone"
                              className="text-[#c83a2b] dark:text-[#d94636] shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-medium truncate">{item.Title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs tabular-nums text-[#494540] dark:text-[#b5b0a8]">
                            <span className="capitalize">{item.Type}</span>
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
                                className="ml-1 bg-[#e2dcd0] dark:bg-[#26262e] px-2.5 py-1 text-xs font-semibold text-[#161514] dark:text-white hover:bg-[#c83a2b] hover:text-white transition-colors cursor-pointer"
                              >
                                Dossier
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : !isSuggesting ? (
                      <div className="px-4 py-3 text-xs text-[#494540] dark:text-[#b5b0a8]">
                        Press Enter to search for &ldquo;{trimmedInput}&rdquo;
                      </div>
                    ) : null}
                  </>
                )}

                {showRecent && (
                  <>
                    <div className="px-4 py-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] bg-[#ebe6dc] dark:bg-[#1d1d23] flex justify-between items-center">
                      <span>Recent queries</span>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setRecentSearches([]);
                        }}
                        className="text-[#c83a2b] dark:text-[#d94636] hover:underline cursor-pointer text-xs font-semibold"
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
                            ? 'bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#161514] dark:text-white'
                            : 'hover:bg-[#ebe6dc] dark:hover:bg-[#1d1d23] text-[#161514] dark:text-[#f2efe9]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <ClockCounterClockwise
                            size={16}
                            className="text-[#6b655e] shrink-0"
                            aria-hidden="true"
                          />
                          <span className="font-medium truncate">{item.term}</span>
                          {(item.year || (item.type && item.type !== 'All')) && (
                            <span className="text-xs tabular-nums text-[#494540] dark:text-[#b5b0a8]">
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
                          className="text-[#6b655e] hover:text-[#161514] dark:hover:text-white p-1 cursor-pointer"
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Release Year Filter (2 cols) */}
          <div className="md:col-span-2">
            <label
              htmlFor="release-year-input"
              className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
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
              placeholder="1880–2026"
              aria-invalid={Boolean(yearError)}
              aria-describedby={yearError ? 'release-year-error' : undefined}
              className="w-full h-11 px-3 tabular-nums text-sm text-[#161514] dark:text-white bg-[#f5f2eb] dark:bg-[#0c0c0e] placeholder:text-[#6b655e] focus:outline-none focus:ring-2 focus:ring-[#c83a2b] transition-all [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
            />
          </div>

          {/* Content Type Native Accessible Select (2 cols) */}
          <div className="md:col-span-2 relative">
            <label
              id="content-type-label"
              htmlFor="content-type-select"
              className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-1.5"
            >
              Content Type
            </label>
            <div className="relative">
              <select
                id="content-type-select"
                aria-label="Content Type"
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value)}
                className="w-full h-11 pl-3 pr-8 text-sm font-medium text-[#161514] dark:text-white bg-[#f5f2eb] dark:bg-[#0c0c0e] appearance-none focus:outline-none focus:ring-2 focus:ring-[#c83a2b] transition-all cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="movie">Movies</option>
                <option value="series">TV Series</option>
                <option value="episode">Episodes</option>
              </select>
              <CaretDown
                size={14}
                weight="bold"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b655e] pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Submit Search Button (2 cols) */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] text-white cursor-pointer text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap"
            >
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Inline Validation Alert */}
        {yearError && (
          <div
            id="release-year-error"
            role="alert"
            className="inline-flex items-center gap-2 self-start bg-[#c83a2b] px-4 py-2.5 text-xs font-semibold text-white"
          >
            <WarningCircle size={16} weight="bold" aria-hidden="true" />
            <span>{yearError}</span>
          </div>
        )}
      </form>
    </section>
  );
};

export default SearchBar;
