import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import PosterArtwork from './PosterArtwork.jsx';
import WatchlistButton from '../features/WatchlistButton.jsx';

/**
 * MovieCard with accessible link, lazy-loaded 2:3 poster with N/A fallback,
 * group-hover:scale-105 duration-700 physics, unboxed typographic metadata, and Watchlist toggle (CS-03, CS-15, F2).
 */
const MovieCard = ({ curMovie, navigateToMovie }) => {
  if (!curMovie) return null;

  const typeLabel = curMovie.Type
    ? curMovie.Type.charAt(0).toUpperCase() + curMovie.Type.slice(1)
    : 'Movie';

  const detailsPath = `/movies/${curMovie.imdbID}`;
  const hasRating = Boolean(
    curMovie.imdbRating && curMovie.imdbRating !== 'N/A'
  );

  return (
    <article className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white dark:bg-[#121216] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-2xl hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <Link
          to={detailsPath}
          onClick={(e) => {
            if (navigateToMovie) {
              e.preventDefault();
              navigateToMovie();
            }
          }}
          aria-label={`View details for ${curMovie.Title} (${curMovie.Year})`}
          className="block w-full h-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#d93829]"
        >
          <PosterArtwork
            src={curMovie.Poster}
            title={curMovie.Title}
            year={curMovie.Year}
            className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"
          />
        </Link>

        <div className="absolute top-2.5 right-2.5 z-10">
          <WatchlistButton movie={curMovie} variant="card" />
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between p-4">
        <Link
          to={detailsPath}
          onClick={(e) => {
            if (navigateToMovie) {
              e.preventDefault();
              navigateToMovie();
            }
          }}
          className="font-display text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-[#d93829] dark:group-hover:text-[#e84a3b] line-clamp-2 mb-2.5 transition-colors focus:outline-none focus:underline"
        >
          {curMovie.Title}
        </Link>

        {/* Unboxed typographic metadata row */}
        <div className="mt-auto pt-2.5 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
          <span className="truncate flex items-center gap-2">
            <span className="font-sans font-semibold text-zinc-700 dark:text-zinc-300">
              {typeLabel}
            </span>
            {curMovie.Year ? (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                <span>{curMovie.Year}</span>
              </>
            ) : null}
          </span>

          {hasRating && (
            <span
              aria-label={`IMDb rating ${curMovie.imdbRating}`}
              className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 shrink-0"
            >
              <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>{curMovie.imdbRating}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default MovieCard;