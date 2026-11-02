import { PiPopcornDuotone, PiSmileySad } from 'react-icons/pi';
import { Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Reusable EmptyState for untouched search, empty search results, or empty watchlist.
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
      className={`flex flex-col w-full justify-center items-center text-center px-6 max-w-lg mx-auto ${
        isPrompt ? 'py-6 min-h-[22dvh]' : 'py-12 min-h-[38dvh]'
      }`}
    >
      <div className="mb-4 rounded-2xl bg-zinc-200/70 dark:bg-white/[0.04] border border-zinc-300/60 dark:border-white/[0.08] p-4 text-[#d93829] dark:text-[#e84a3b]">
        {isNoResults ? (
          <PiSmileySad size={44} aria-hidden="true" />
        ) : isWatchlist ? (
          <Bookmark className="w-10 h-10" aria-hidden="true" />
        ) : (
          <PiPopcornDuotone size={44} aria-hidden="true" />
        )}
      </div>

      <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white mb-2">
        {title ||
          (isNoResults
            ? 'No titles matched your search'
            : isWatchlist
              ? 'Your Watchlist is Empty'
              : 'Search the Cinema Index')}
      </h2>

      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-[52ch]">
          {description}
        </p>
      )}

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-xl bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
