import { FilmSlate, MagnifyingGlass, BookmarkSimple } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

/**
 * Composed EmptyState for untouched search, empty search results, or empty watchlist.
 */
const EmptyState = ({
  variant = 'prompt',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => {
  const isNoResults = variant === 'no-results';
  const isWatchlist = variant === 'watchlist';
  const isPrompt = variant === 'prompt';

  return (
    <div
      data-testid={`empty-state-${variant}`}
      className={`flex flex-col w-full justify-center items-center text-center px-6 max-w-lg mx-auto bg-[#ebe6dc] dark:bg-[#151519] ${
        isPrompt ? 'py-10 min-h-[20dvh]' : 'py-14 min-h-[36dvh]'
      }`}
    >
      <div className="mb-4 bg-[#e2dcd0] dark:bg-[#1d1d23] p-4 text-[#c83a2b] dark:text-[#d94636]">
        {isNoResults ? (
          <MagnifyingGlass size={32} weight="duotone" aria-hidden="true" />
        ) : isWatchlist ? (
          <BookmarkSimple size={32} weight="duotone" aria-hidden="true" />
        ) : (
          <FilmSlate size={32} weight="duotone" aria-hidden="true" />
        )}
      </div>

      <h2 className="font-display text-2xl font-bold text-[#161514] dark:text-white mb-2">
        {title ||
          (isNoResults
            ? 'No matching titles'
            : isWatchlist
              ? 'Watchlist is empty'
              : 'Search the index')}
      </h2>

      {description && (
        <p className="text-base text-[#494540] dark:text-[#b5b0a8] mb-6 leading-relaxed max-w-[50ch]">
          {description}
        </p>
      )}

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-6 py-3 text-xs font-semibold text-white transition-all"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-6 py-3 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
