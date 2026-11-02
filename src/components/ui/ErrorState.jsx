import {
  ArrowCounterClockwise,
  BookmarkSimple,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

/**
 * Direct, active-voice error state presentation distinguishing quota exhaustion,
 * network drops, not-found titles, and upstream failures.
 */
const ErrorState = ({ error, onRetry, titleOverride }) => {
  const kind = error?.kind || 'upstream';
  const message =
    error?.message || 'Connection to the catalogue service failed. Please try again.';

  const config = {
    quota: {
      heading: titleOverride || 'Daily API quota reached',
      description:
        'The free OMDb API tier allows 1,000 requests per day (HTTP 429). Repeat searches within your session and your saved Watchlist continue to work offline without using quota.',
    },
    network: {
      heading: titleOverride || 'Catalogue unreachable',
      description: message,
    },
    'not-found': {
      heading: titleOverride || 'Title not in index',
      description:
        'We could not find a movie or series matching that identifier (HTTP 404). Verify the IMDb ID or return to the catalogue search.',
    },
    upstream: {
      heading: titleOverride || 'Catalogue unavailable',
      description: message,
    },
  }[kind] || {
    heading: titleOverride || 'Unable to load record',
    description: message,
  };

  return (
    <div
      role="alert"
      data-testid={`error-state-${kind}`}
      className="my-12 mx-auto max-w-xl bg-[#ebe6dc] dark:bg-[#151519] p-8 text-center animate-editorial-in"
    >
      <h2 className="font-display text-2xl font-bold text-[#161514] dark:text-white mb-3">
        {config.heading}
      </h2>

      <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed mb-7 max-w-[50ch] mx-auto">
        {config.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-5 py-2.5 text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] cursor-pointer transition-all"
          >
            <ArrowCounterClockwise size={15} weight="bold" aria-hidden="true" />
            <span>Try Again</span>
          </button>
        )}

        <Link
          to="/watchlist"
          className="inline-flex items-center gap-2 bg-[#e2dcd0] dark:bg-[#1d1d23] px-5 py-2.5 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] hover:bg-[#d5cec0] dark:hover:bg-[#26262e] active:scale-[0.98] transition-all"
        >
          <BookmarkSimple size={15} weight="duotone" aria-hidden="true" />
          <span>Open Watchlist</span>
        </Link>

        <Link
          to="/movies"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] hover:text-[#161514] dark:hover:text-white transition-colors"
        >
          Browse Catalogue
        </Link>
      </div>
    </div>
  );
};

export default ErrorState;
