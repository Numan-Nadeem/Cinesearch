import { BookmarkSimple, Check } from '@phosphor-icons/react';
import { useWatchlist } from '../../context/WatchlistContext.jsx';

/**
 * Keyboard-operable Watchlist toggle button for result cards and details page.
 * Flat fill colour, square corners, no glass or resting shadows.
 */
const WatchlistButton = ({ movie, variant = 'card', className = '' }) => {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const imdbID = movie?.imdbID || movie?.id;
  const saved = isInWatchlist(imdbID);
  const title = movie?.Title || 'title';

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWatchlist(movie);
  };

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from Watchlist` : `Add ${title} to Watchlist`}
        className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer whitespace-nowrap shrink-0 ${
          saved
            ? 'bg-[#c83a2b] text-white hover:bg-[#a92e21]'
            : 'bg-[#161514] dark:bg-[#f2efe9] text-[#f2efe9] dark:text-[#161514] hover:opacity-90'
        } ${className}`}
      >
        {saved ? (
          <>
            <Check size={16} weight="bold" aria-hidden="true" />
            <span>In Watchlist</span>
          </>
        ) : (
          <>
            <BookmarkSimple size={16} weight="duotone" aria-hidden="true" />
            <span>Add to Watchlist</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from Watchlist` : `Save ${title} to Watchlist`}
      title={saved ? `Remove ${title} from Watchlist` : `Save ${title} to Watchlist`}
      className={`inline-flex items-center justify-center p-2.5 transition-all duration-150 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer ${
        saved
          ? 'bg-[#c83a2b] text-white hover:bg-[#a92e21]'
          : 'bg-[#161514] text-[#f2efe9] hover:bg-[#c83a2b] hover:text-white'
      } ${className}`}
    >
      <BookmarkSimple
        size={16}
        weight={saved ? 'fill' : 'regular'}
        aria-hidden="true"
      />
    </button>
  );
};

export default WatchlistButton;
