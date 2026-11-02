import { useEffect, useRef } from 'react';
import { CircularProgress } from '@mui/material';
import MovieCard from '../ui/MovieCard.jsx';

/**
 * Displays total results count with tabular numerals, movie cards grid,
 * stable IntersectionObserver infinite scroll, and explicit pagination fallback button (F4, CS-06, CS-23).
 */
const ResultGrid = ({
  items = [],
  totalResults = 0,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  onNavigateToMovie,
  queryLabel = '',
}) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const currentPage = Math.max(1, Math.ceil(items.length / 10));
  const totalPages = Math.max(1, Math.ceil(totalResults / 10));

  return (
    <section
      aria-label="Search results"
      className="max-w-7xl mx-auto px-6 md:px-10 py-10"
    >
      {/* Result Count & Page Status Header (CS-23) */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-7 pb-3.5 border-b border-zinc-200/90 dark:border-white/[0.08]">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Found{' '}
          <strong className="font-mono tabular-nums text-zinc-950 dark:text-white">
            {totalResults}
          </strong>{' '}
          {totalResults === 1 ? 'result' : 'results'}
          {queryLabel ? (
            <>
              {' '}
              for{' '}
              <span className="font-display italic font-semibold text-[#d93829] dark:text-[#e84a3b]">
                &ldquo;{queryLabel}&rdquo;
              </span>
            </>
          ) : null}
        </p>
        <span className="font-mono tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
          Showing {items.length} of {totalResults} · Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Movie Cards Grid */}
      <div
        data-testid="movie-results-grid"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-sm:gap-4"
      >
        {items.map((curMovie) => (
          <MovieCard
            key={curMovie.imdbID}
            curMovie={curMovie}
            navigateToMovie={() => onNavigateToMovie(curMovie.imdbID)}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel + Explicit Pagination Fallback Button (CS-06, CS-23) */}
      <div ref={sentinelRef} className="mt-12 flex flex-col items-center justify-center gap-3">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-3 py-4 text-sm text-zinc-600 dark:text-zinc-300">
            <CircularProgress size="1.5rem" color="inherit" />
            <span>Loading next reel...</span>
          </div>
        ) : hasNextPage ? (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#141418] px-6 py-2.5 text-xs font-mono tabular-nums font-semibold text-zinc-900 dark:text-white hover:border-[#d93829] dark:hover:border-[#e84a3b] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer transition-all duration-200 shadow-xs"
          >
            Load More Results · Page {currentPage + 1} of {totalPages}
          </button>
        ) : items.length > 0 ? (
          <p className="font-mono tabular-nums text-xs text-zinc-500 dark:text-zinc-400 py-2">
            End of index · {items.length} of {totalResults} titles displayed
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default ResultGrid;
