import { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../ui/ThemeToggle.jsx';

/**
 * Designed Colophon Footer with full-width display close, media & archival credits,
 * OMDb + TMDB catalogue attribution, and accessible legal disclosures.
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
    <footer className="relative z-10 mt-auto text-[#161514] dark:text-[#f2efe9] bg-[#e2dcd0] dark:bg-[#151519] pt-16 pb-12 transition-colors">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 items-start">
          {/* Colophon Brand & Mission */}
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#161514] dark:text-[#f2efe9] mb-3">
              CineSearch Repertory
            </h2>
            <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed max-w-[48ch] mb-6">
              An archival film and television discovery companion. Query dual catalogues across OMDb and TMDB, weigh IMDb audience reception against Rotten Tomatoes and Metacritic consensus, and curate a private local Watchlist.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
            </div>
          </div>

          {/* Primary Navigation Paths */}
          <div className="lg:col-span-3">
            <h3 className="font-display text-lg font-bold text-[#161514] dark:text-[#f2efe9] mb-3">
              Index Directory
            </h3>
            <ul className="space-y-2 text-sm text-[#494540] dark:text-[#b5b0a8]">
              <li>
                <Link to="/" className="hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors">
                  Repertory Frontispiece
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors">
                  Browse Full Catalogue
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors">
                  Personal Watchlist Vault
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors">
                  Architectural Monograph
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors">
                  Curatorial Dispatch
                </Link>
              </li>
            </ul>
          </div>

          {/* Attribution, Media Credits & Legal Disclosures */}
          <div className="lg:col-span-4">
            <h3 className="font-display text-lg font-bold text-[#161514] dark:text-[#f2efe9] mb-3">
              Provenance &amp; Credits
            </h3>
            <p className="text-sm text-[#494540] dark:text-[#b5b0a8] leading-relaxed mb-3">
              Critical consensus and filmography records supplied by the{' '}
              <a
                href="https://www.omdbapi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#c83a2b] transition-colors"
              >
                OMDb API
              </a>{' '}
              and{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#c83a2b] transition-colors"
              >
                TMDB API
              </a>{' '}
              (not endorsed or certified by TMDB).
            </p>
            <p className="text-xs text-[#6b655e] dark:text-[#8a847c] leading-relaxed mb-4">
              Archival Plates &amp; Footage: Repository 35mm Reel Loop (<code>intro_bg.mp4</code>, MIT), Repository Auditorium &amp; Optical Plates (<code>movie_bg.jpg</code>, <code>contact_bg2.jpg</code>, MIT), and Official Promotional Stills courtesy of Warner Bros., Legendary Pictures, Universal Pictures, CJ Entertainment, and AMC via TMDB.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#494540] dark:text-[#b5b0a8]">
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="hover:text-[#161514] dark:hover:text-white underline cursor-pointer transition-colors"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="hover:text-[#161514] dark:hover:text-white underline cursor-pointer transition-colors"
              >
                Terms of Service
              </button>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                &copy; {new Date().getFullYear()} Numan Nadeem (MIT)
              </span>
            </div>
          </div>
        </div>

        {/* Designed Close: Full-Width Wordmark */}
        <div className="pt-6 select-none overflow-hidden">
          <Link
            to="/"
            aria-label="Return to CineSearch top"
            className="block font-display font-bold tracking-[-0.04em] leading-[0.88] text-[clamp(3.25rem,11vw,9.5rem)] text-[#161514] dark:text-[#f2efe9] hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
          >
            CineSearch
          </Link>
        </div>
      </div>

      {legalModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setLegalModal(null)}
        >
          <div
            className="w-full max-w-lg bg-[#f5f2eb] dark:bg-[#151519] p-6 sm:p-8 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2
                id="legal-modal-title"
                className="font-display text-xl font-bold text-[#161514] dark:text-white"
              >
                {legalModal === 'privacy'
                  ? 'Privacy Policy'
                  : 'Terms of Service'}
              </h2>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                aria-label="Close legal disclosure"
                className="p-1.5 text-[#494540] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] hover:text-[#161514] dark:hover:text-white cursor-pointer transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {legalModal === 'privacy' ? (
              <div className="space-y-3 text-sm text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
                <p>
                  <strong>Zero Telemetry:</strong> CineSearch does not collect personal analytics, behavioral profiles, or third-party advertising cookies.
                </p>
                <p>
                  <strong>Local-First Persistence:</strong> Your saved Watchlist, recent search history, and theme preferences live exclusively in your browser&apos;s <code>localStorage</code>. You can export or clear this vault at any time.
                </p>
                <p>
                  <strong>API Requests:</strong> Search queries are proxied through serverless functions to OMDb or TMDB without logging personal identifiers.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
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
                className="bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-5 py-2 text-xs font-semibold text-white cursor-pointer transition-all"
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