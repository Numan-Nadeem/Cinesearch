import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SquaresFour,
  ListDashes,
  Star,
  ArrowUpRight,
  CircleNotch,
} from '@phosphor-icons/react';
import MovieCard from '../ui/MovieCard.jsx';
import WatchlistButton from './WatchlistButton.jsx';

/**
 * Displays total results count with tabular numerals, view mode switcher (Poster Gallery vs Archival Ledger),
 * stable IntersectionObserver infinite scroll, and explicit pagination fallback button.
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'ledger'

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
      className="max-w-[1360px] mx-auto px-5 sm:px-8 py-12 w-full"
    >
      {/* Result Count, Page Status & View Mode Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-[#ebe6dc] dark:bg-[#151519] p-4 sm:p-5">
        <div>
          <p className="text-base font-medium text-[#161514] dark:text-[#f2efe9]">
            Found{' '}
            <strong className="tabular-nums font-bold">
              {totalResults}
            </strong>{' '}
            {totalResults === 1 ? 'archival record' : 'archival records'}
            {queryLabel ? (
              <>
                {' '}
                for{' '}
                <span className="font-display font-bold text-[#c83a2b] dark:text-[#d94636]">
                  &ldquo;{queryLabel}&rdquo;
                </span>
              </>
            ) : null}
          </p>
          <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
            Showing {items.length} of {totalResults} · Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Interactive View Switcher (Segmented Control) */}
        <div
          role="group"
          aria-label="Display mode"
          className="inline-flex items-center gap-1 p-1 bg-[#e2dcd0] dark:bg-[#1d1d23]"
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-[#c83a2b] text-white'
                : 'text-[#494540] dark:text-[#b5b0a8] hover:text-[#161514] dark:hover:text-white'
            }`}
          >
            <SquaresFour size={15} weight="duotone" aria-hidden="true" />
            <span>Poster Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('ledger')}
            aria-pressed={viewMode === 'ledger'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              viewMode === 'ledger'
                ? 'bg-[#c83a2b] text-white'
                : 'text-[#494540] dark:text-[#b5b0a8] hover:text-[#161514] dark:hover:text-white'
            }`}
          >
            <ListDashes size={15} weight="duotone" aria-hidden="true" />
            <span>Archival Ledger</span>
          </button>
        </div>
      </div>

      {/* Results Presentation: Poster Gallery OR Tabular Archival Ledger */}
      {viewMode === 'grid' ? (
        <div
          data-testid="movie-results-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {items.map((curMovie) => (
            <MovieCard
              key={curMovie.imdbID}
              curMovie={curMovie}
              navigateToMovie={() => onNavigateToMovie(curMovie.imdbID)}
            />
          ))}
        </div>
      ) : (
        <div
          data-testid="movie-results-grid"
          className="flex flex-col gap-2"
        >
          {items.map((curMovie) => {
            const hasRating = Boolean(
              curMovie.imdbRating && curMovie.imdbRating !== 'N/A'
            );
            return (
              <article
                key={curMovie.imdbID}
                className="p-4 sm:px-6 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="min-w-0">
                  <Link
                    to={`/movies/${curMovie.imdbID}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToMovie(curMovie.imdbID);
                    }}
                    className="font-display text-lg font-bold text-[#161514] dark:text-white hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors truncate block"
                  >
                    {curMovie.Title}
                  </Link>
                  <div className="text-xs tabular-nums text-[#494540] dark:text-[#b5b0a8] flex flex-wrap items-center gap-2 mt-1">
                    <span className="capitalize font-semibold text-[#161514] dark:text-[#f2efe9]">
                      {curMovie.Type || 'Movie'}
                    </span>
                    <span>·</span>
                    <span>{curMovie.Year || '—'}</span>
                    {curMovie.Genre && (
                      <>
                        <span>·</span>
                        <span>{curMovie.Genre}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  {hasRating && (
                    <span className="inline-flex items-center gap-1 tabular-nums text-xs font-semibold text-[#b87d24] dark:text-[#deb052]">
                      <Star size={14} weight="fill" aria-hidden="true" />
                      <span>{curMovie.imdbRating}</span>
                    </span>
                  )}
                  <WatchlistButton movie={curMovie} variant="card" />
                  <Link
                    to={`/movies/${curMovie.imdbID}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateToMovie(curMovie.imdbID);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#161514] dark:text-white hover:text-[#c83a2b] dark:hover:text-[#d94636] whitespace-nowrap"
                  >
                    <span>Dossier</span>
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Infinite Scroll Sentinel + Explicit Pagination Fallback Button */}
      <div ref={sentinelRef} className="mt-12 flex flex-col items-center justify-center gap-3">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2.5 py-4 text-sm text-[#494540] dark:text-[#b5b0a8]">
            <CircleNotch size={18} className="animate-spin text-[#c83a2b]" aria-hidden="true" />
            <span>Loading next archival reel...</span>
          </div>
        ) : hasNextPage ? (
          <button
            type="button"
            onClick={() => fetchNextPage()}
            className="bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-6 py-3 text-xs tabular-nums font-semibold text-[#161514] dark:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer transition-all duration-150"
          >
            Load More Results · Page {currentPage + 1} of {totalPages}
          </button>
        ) : items.length > 0 ? (
          <p className="tabular-nums text-xs text-[#6b655e] dark:text-[#8a847c] py-2">
            End of index · {items.length} of {totalResults} titles displayed
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default ResultGrid;
