import { useNavigate, useRouteError, Link } from 'react-router-dom';
import { FilmReel, ArrowLeft, House, Compass } from '@phosphor-icons/react';
import ErrorState from '../components/ui/ErrorState.jsx';
import SectionKicker from '../components/ui/SectionKicker.jsx';
import { useDocumentMeta } from '../lib/seo.js';

/**
 * Branded Archival 404 & Route Error Handler.
 * Replaces the legacy green Matrix terminal with an editorial Missing Archival Reel experience.
 */
const NotFound = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  const isApiError = Boolean(error?.kind);
  const status = error?.status || (isApiError ? error.status : 404);

  useDocumentMeta({
    title: status === 404 ? '404 — Archival Reel Not Found' : 'Error Loading Record',
  });

  if (isApiError) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <ErrorState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div
      data-testid="not-found-terminal"
      className="min-h-[75dvh] flex-1 flex items-center justify-center px-6 py-16 bg-[#f7f4ee] dark:bg-[#0c0c0e] text-stone-900 dark:text-[#f2efe9]"
    >
      <div className="max-w-xl w-full archival-surface rounded-xl p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 w-14 h-14 rounded-xl bg-[#c83a2b]/12 border border-[#c83a2b]/25 flex items-center justify-center text-[#c83a2b] dark:text-[#d94636]">
          <FilmReel size={30} weight="duotone" aria-hidden="true" />
        </div>

        <SectionKicker index={String(status || 404)} className="mb-2 justify-center">
          Missing Archival Reel
        </SectionKicker>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-stone-950 dark:text-white tracking-tight mb-3">
          This frame is missing from the projection booth.
        </h1>

        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed mb-8">
          The page or film dossier you requested may have been relocated, mistyped, or removed from the active catalogue index.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-300/90 dark:border-white/15 bg-[#fcfbf8] dark:bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:border-[#c83a2b] active:scale-[0.98] cursor-pointer transition-all"
          >
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            <span>Go Back</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer transition-all"
          >
            <House size={15} weight="duotone" aria-hidden="true" />
            <span>Return to Homepage</span>
          </button>

          <Link
            to="/movies"
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
          >
            <Compass size={15} weight="duotone" aria-hidden="true" />
            <span>Browse Catalogue</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;