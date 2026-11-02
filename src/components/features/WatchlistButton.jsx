import { Bookmark, Check } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext.jsx';

/**
 * Keyboard-operable Watchlist toggle button for result cards and details page (F2).
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
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer ${
          saved
            ? 'bg-[#d93829] text-white hover:bg-[#b82d20] shadow-md'
            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90 border border-transparent'
        } ${className}`}
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>In Watchlist</span>
          </>
        ) : (
          <>
            <Bookmark className="w-4 h-4" aria-hidden="true" />
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
      className={`inline-flex items-center justify-center rounded-lg p-2 backdrop-blur-md transition-all duration-200 active:scale-[0.95] focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer shadow-md ${
        saved
          ? 'bg-[#d93829] text-white hover:bg-[#b82d20]'
          : 'bg-black/65 text-white hover:bg-black/85 border border-white/15'
      } ${className}`}
    >
      <Bookmark
        className={`w-4 h-4 ${saved ? 'fill-current' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
};

export default WatchlistButton;
