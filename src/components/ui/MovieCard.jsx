import { Link } from 'react-router-dom';
import { Star, ArrowUpRight } from '@phosphor-icons/react';
import PosterArtwork from './PosterArtwork.jsx';
import WatchlistButton from '../features/WatchlistButton.jsx';

/**
 * Editorial MovieCard with 2:3 square-cornered poster artwork,
 * tone-stepped flat surface, unboxed typographic metadata, and bottom-pinned dossier action.
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

  const handleLinkClick = (e) => {
    if (navigateToMovie) {
      e.preventDefault();
      navigateToMovie();
    }
  };

  return (
    <article className="spotlight-card group relative flex flex-col h-full overflow-hidden bg-[#ebe6dc] dark:bg-[#151519]">
      {/* 2:3 Square-Cornered Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#151519]">
        <Link
          to={detailsPath}
          onClick={handleLinkClick}
          aria-label={`View details for ${curMovie.Title} (${curMovie.Year})`}
          className="block w-full h-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c83a2b]"
        >
          <PosterArtwork
            src={curMovie.Poster}
            title={curMovie.Title}
            year={curMovie.Year}
            className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top-Right Watchlist Bookmark */}
        <div className="absolute top-3 right-3 z-10">
          <WatchlistButton movie={curMovie} variant="card" />
        </div>
      </div>

      {/* Editorial Body & Bottom-Pinned Footer */}
      <div className="relative z-10 flex flex-col flex-1 justify-between p-5">
        <div>
          <Link
            to={detailsPath}
            onClick={handleLinkClick}
            className="variable-display-link font-display text-lg font-bold tracking-tight text-[#161514] dark:text-[#f2efe9] group-hover:text-[#c83a2b] dark:group-hover:text-[#d94636] line-clamp-2 leading-snug block mb-2 focus-visible:outline-none focus-visible:underline"
          >
            {curMovie.Title}
          </Link>

          {/* Unboxed Typographic Metadata Line */}
          <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-[#494540] dark:text-[#b5b0a8]">
            <span className="truncate">
              <span className="font-medium text-[#161514] dark:text-[#f2efe9]">
                {typeLabel}
              </span>
              {curMovie.Year ? (
                <>
                  <span aria-hidden="true" className="mx-1.5">
                    ·
                  </span>
                  <span>{curMovie.Year}</span>
                </>
              ) : null}
            </span>

            {hasRating && (
              <span
                aria-label={`IMDb rating ${curMovie.imdbRating}`}
                className="inline-flex items-center gap-1 font-semibold text-[#b87d24] dark:text-[#deb052] shrink-0"
              >
                <Star size={13} weight="fill" aria-hidden="true" />
                <span>{curMovie.imdbRating}</span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom-Pinned Tone-Stepped Dossier Bar */}
        <div className="mt-4 pt-3 flex items-center justify-between text-xs">
          <span className="tabular-nums text-xs text-[#6b655e] dark:text-[#8a847c] truncate">
            {curMovie.Genre ? curMovie.Genre.split(',')[0] : curMovie.imdbID}
          </span>
          <Link
            to={detailsPath}
            onClick={handleLinkClick}
            tabIndex={-1}
            aria-hidden="true"
            className="inline-flex items-center gap-1 font-semibold text-[#161514] dark:text-[#f2efe9] group-hover:text-[#c83a2b] dark:group-hover:text-[#d94636] transition-colors whitespace-nowrap shrink-0"
          >
            <span>Inspect dossier</span>
            <ArrowUpRight
              size={13}
              weight="bold"
              className="transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default MovieCard;