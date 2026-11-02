import { useState, useEffect } from 'react';
import { MdTheaters } from 'react-icons/md';
import { Link } from 'react-router-dom';

/**
 * Editorial Footer with navigation links, Privacy/Terms disclosure modal with Escape-key dismissal,
 * and required OMDb + TMDB catalogue attribution (F8).
 */
const Footer = () => {
  const [legalModal, setLegalModal] = useState(null); // 'privacy' | 'terms' | null

  useEffect(() => {
    if (!legalModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLegalModal(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [legalModal]);

  return (
    <footer className="relative z-10 mt-auto text-zinc-700 dark:text-zinc-300 bg-[#f0eee9] dark:bg-[#08080a] py-12 border-t border-zinc-200/90 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-zinc-300/70 dark:border-white/[0.08]">
          <div className="md:col-span-5">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-zinc-900 dark:text-white hover:text-[#d93829] transition-colors mb-3"
            >
              <MdTheaters size={24} className="text-[#d93829]" aria-hidden="true" />
              <span className="font-display text-xl font-bold tracking-tight">CineSearch</span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[46ch]">
              An editorial film &amp; television index. Search across rich catalogues, compare critical consensus from IMDb, Rotten Tomatoes &amp; Metacritic, and curate a private local-first Watchlist.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 dark:text-zinc-200 mb-3.5">
              Index &amp; Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <Link to="/" className="hover:text-[#d93829] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-[#d93829] transition-colors">
                  Browse Catalogue
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-[#d93829] transition-colors">
                  Personal Watchlist
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#d93829] transition-colors">
                  About the Index
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#d93829] transition-colors">
                  Contact &amp; Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 dark:text-zinc-200 mb-3.5">
              Catalogue Attribution
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
              Aggregated critical ratings and film metadata provided by the{' '}
              <a
                href="https://www.omdbapi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-400 underline-offset-2 hover:text-[#d93829] transition-colors"
              >
                OMDb API
              </a>
              . This product uses the{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-zinc-400 underline-offset-2 hover:text-[#d93829] transition-colors"
              >
                TMDB API
              </a>{' '}
              but is not endorsed or certified by TMDB.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:text-zinc-900 dark:hover:text-white underline decoration-zinc-400/60 underline-offset-2 cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-zinc-900 dark:hover:text-white underline decoration-zinc-400/60 underline-offset-2 cursor-pointer transition-colors"
              >
                Terms of Use
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p className="tabular-nums">
            &copy; {new Date().getFullYear()} CineSearch. Released under the MIT License.
          </p>
          <p className="text-zinc-500 dark:text-zinc-500">
            Crafted by Numan Nadeem · Zero third-party tracking
          </p>
        </div>
      </div>

      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#f8f7f4] dark:bg-[#141418] p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-white/10 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2
                id="legal-modal-title"
                className="font-display text-xl font-bold text-zinc-900 dark:text-white"
              >
                {legalModal === 'privacy' ? 'Privacy Policy — Local-First Storage' : 'Terms of Use & Attribution'}
              </h2>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close legal disclosure"
                className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-200/60 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {legalModal === 'privacy' ? (
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  <strong>Zero Telemetry:</strong> CineSearch does not collect personal analytics, behavioral profiles, or third-party advertising cookies.
                </p>
                <p>
                  <strong>Local-First Persistence:</strong> Your saved Watchlist, recent search history, and theme preferences are stored exclusively in your browser&apos;s <code>localStorage</code>. You can export or clear this data at any time.
                </p>
                <p>
                  <strong>API Requests:</strong> Search queries are proxied through serverless functions to OMDb or TMDB without logging personal identifiers.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  <strong>MIT Open Source License:</strong> CineSearch is provided &ldquo;as is&rdquo; under the MIT License for personal, educational, and non-commercial film discovery.
                </p>
                <p>
                  <strong>Catalogue Data:</strong> Poster artwork, synopses, and critical scores remain the intellectual property of their respective rightsholders via the OMDb API and TMDB API.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="rounded-lg bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-5 py-2 text-xs font-semibold text-white cursor-pointer transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;