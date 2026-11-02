import { AlertTriangle, WifiOff, Clock, Film, RefreshCw, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Honest, typed error state presentation distinguishing quota exhaustion,
 * network drops, not-found titles, and upstream failures (F4, CS-01, CS-04).
 */
const ErrorState = ({ error, onRetry, titleOverride }) => {
  const kind = error?.kind || 'upstream';
  const message =
    error?.message || 'An unexpected error occurred while communicating with the catalogue.';

  const config = {
    quota: {
      icon: Clock,
      badge: 'Daily Quota Limit · HTTP 429',
      heading: titleOverride || 'Daily API Quota Reached',
      description:
        'The free OMDb API tier allows 1,000 requests per day. Repeat searches within your session and your saved Watchlist continue to work offline without using quota.',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    network: {
      icon: WifiOff,
      badge: 'Connection Interrupted',
      heading: titleOverride || 'Unable to Reach Catalogue',
      description: message,
      accent: 'text-[#d93829] dark:text-[#e84a3b]',
    },
    'not-found': {
      icon: Film,
      badge: 'Not Found · HTTP 404',
      heading: titleOverride || 'Title Not Found',
      description:
        'We could not find a movie or series matching that identifier. It may have been mistyped or removed from the index.',
      accent: 'text-zinc-600 dark:text-zinc-400',
    },
    upstream: {
      icon: AlertTriangle,
      badge: 'Service Error',
      heading: titleOverride || 'Catalogue Temporarily Unavailable',
      description: message,
      accent: 'text-[#d93829] dark:text-[#e84a3b]',
    },
  }[kind] || {
    icon: AlertTriangle,
    badge: 'Error',
    heading: titleOverride || 'Something Went Wrong',
    description: message,
    accent: 'text-[#d93829] dark:text-[#e84a3b]',
  };

  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      data-testid={`error-state-${kind}`}
      className="my-12 mx-auto max-w-xl rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-[#141418] p-8 text-center shadow-xl animate-editorial-in"
    >
      <div className={`mx-auto mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] font-semibold ${config.accent}`}>
        <IconComponent className="w-4 h-4" aria-hidden="true" />
        <span>{config.badge}</span>
      </div>

      <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-white mb-2.5">
        {config.heading}
      </h2>

      <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-7 max-w-[54ch] mx-auto">
        {config.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer transition-all"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </button>
        )}

        <Link
          to="/watchlist"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300/80 dark:border-white/15 bg-zinc-100 dark:bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-white/25 active:scale-[0.98] transition-all"
        >
          <Bookmark className="w-4 h-4" aria-hidden="true" />
          Open Watchlist
        </Link>

        <Link
          to="/movies"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          Browse Catalogue
        </Link>
      </div>
    </div>
  );
};

export default ErrorState;
