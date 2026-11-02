import { useState, useEffect } from 'react';
import { useLoaderData, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Play,
  ExternalLink,
} from 'lucide-react';
import PosterArtwork from '../components/ui/PosterArtwork.jsx';
import RatingRow from '../components/ui/RatingRow.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import WatchlistButton from '../components/features/WatchlistButton.jsx';
import ShareRow from '../components/features/ShareRow.jsx';
import { useDocumentMeta } from '../lib/seo.js';

/**
 * Enriched MovieDetails dossier page with multi-source Ratings ledger, suppressed N/A fields,
 * unboxed typographic metadata, dynamic SEO/OpenGraph tags, ShareRow, Watchlist toggle, and Trailer modal/link (CS-01, CS-03, CS-18, CS-19, F2, F3, F8).
 */
const MovieDetails = () => {
  const movieData = useLoaderData();
  const navigate = useNavigate();
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useDocumentMeta({
    title: movieData
      ? `${movieData.Title}${movieData.Year ? ` (${movieData.Year})` : ''}`
      : 'Title Not Found',
    description:
      movieData?.Plot ||
      `View ratings, cast, awards, and trailer for ${movieData?.Title || 'this title'} on CineSearch.`,
    image: movieData?.Poster || '/pwa-512x512.png',
    type: 'video.movie',
  });

  useEffect(() => {
    if (!showTrailerModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowTrailerModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showTrailerModal]);

  if (!movieData || !movieData.Title) {
    return (
      <div className="px-6 py-12">
        <ErrorState
          error={{
            kind: 'not-found',
            message: 'The requested movie or series could not be loaded.',
          }}
        />
      </div>
    );
  }

  const renderCreditRow = (label, values = [], isInteractiveSearch = false) => {
    if (!values || values.length === 0) return null;

    return (
      <div className="border-b border-zinc-200/80 dark:border-white/[0.08] py-3.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
        <span className="font-mono text-xs uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 min-w-32">
          {label}
        </span>
        <ul className="list-none flex flex-wrap items-center gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {values.map((val, idx) => (
            <li
              key={`${label}-${val}-${idx}`}
              className={idx !== 0 ? "before:content-['·'] before:mx-2 before:text-zinc-400" : ''}
            >
              {isInteractiveSearch ? (
                <Link
                  to={`/movies?query=${encodeURIComponent(val)}`}
                  className="hover:text-[#d93829] dark:hover:text-[#e84a3b] underline decoration-zinc-400/50 underline-offset-4 transition-colors"
                >
                  {val}
                </Link>
              ) : (
                <span>{val}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const metadataFacts = [
    { label: 'Language', value: movieData.Language },
    { label: 'Country', value: movieData.Country },
    { label: 'Box Office', value: movieData.BoxOffice, isMono: true },
    { label: 'Released', value: movieData.Released, isMono: true },
    { label: 'Production', value: movieData.Production },
    { label: 'Home Media / DVD', value: movieData.DVD, isMono: true },
    {
      label: 'Total Seasons',
      value: movieData.totalSeasons ? `${movieData.totalSeasons} Seasons` : null,
      isMono: true,
    },
  ].filter((fact) => Boolean(fact.value));

  const metaParts = [
    movieData.Year,
    movieData.Rated,
    movieData.Runtime,
    movieData.Type
      ? movieData.Type.charAt(0).toUpperCase() + movieData.Type.slice(1)
      : null,
  ].filter(Boolean);

  return (
    <article className="pb-20 animate-editorial-in">
      {/* Optional Backdrop Hero Banner (F8) */}
      {movieData.Backdrop && (
        <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#0c0c0e]">
          <img
            src={movieData.Backdrop}
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f7f4] dark:from-[#0c0c0e] via-transparent to-black/50" />
        </div>
      )}

      <div
        className={`max-w-6xl mx-auto px-6 md:px-10 ${
          movieData.Backdrop ? '-mt-24 relative z-10' : 'mt-10'
        }`}
      >
        {/* Top Back Navigation */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-[#141418] border border-zinc-300/80 dark:border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-white/25 active:scale-[0.98] cursor-pointer transition-all duration-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Results</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Poster Artwork + Primary Actions */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <figure className="w-64 sm:w-full max-w-[300px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-zinc-200/80 dark:border-white/10 bg-zinc-900">
              <PosterArtwork
                src={movieData.Poster}
                title={movieData.Title}
                year={movieData.Year}
                eager={true}
                className="w-full h-full"
              />
            </figure>

            <div className="mt-5 w-64 sm:w-full max-w-[300px] flex flex-col gap-2.5">
              <WatchlistButton
                movie={movieData}
                variant="full"
                className="w-full justify-center"
              />

              {movieData.TrailerKey ? (
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-4 py-2.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>Watch Trailer</span>
                </button>
              ) : null}

              <a
                href={movieData.TrailerSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-white/25 active:scale-[0.98] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Find Trailer on YouTube</span>
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Dossier (No nested card-in-card borders) */}
          <div className="lg:col-span-8 flex flex-col gap-7 min-w-0">
            <header className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  {/* Unboxed typographic metadata line */}
                  {metaParts.length > 0 && (
                    <p className="font-mono tabular-nums text-xs uppercase tracking-[0.14em] text-[#d93829] dark:text-[#e84a3b] mb-2">
                      {metaParts.join(' · ')}
                    </p>
                  )}

                  <h1 className="font-display text-3xl sm:text-5xl font-bold text-zinc-950 dark:text-white tracking-tight leading-[1.08]">
                    {movieData.Title}
                  </h1>
                </div>

                <ShareRow title={movieData.Title} year={movieData.Year} />
              </div>

              {/* Interactive Genre Filter Links */}
              {movieData.Genres && movieData.Genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1" aria-label="Genres">
                  {movieData.Genres.map((genre) => (
                    <Link
                      key={genre}
                      to={`/movies?query=${encodeURIComponent(genre)}`}
                      className="rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] px-3 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:border-[#d93829] hover:text-[#d93829] dark:hover:text-[#e84a3b] transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              {/* Multi-Source Ratings Ledger: IMDb, Rotten Tomatoes, Metacritic (F3) */}
              <RatingRow
                ratings={movieData.Ratings}
                boxOffice={movieData.BoxOffice}
              />
            </header>

            {movieData.Plot && (
              <section aria-label="Plot summary">
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 mb-2.5">
                  Synopsis
                </h2>
                <p className="text-base sm:text-[1.0625rem] text-zinc-800 dark:text-zinc-200 leading-relaxed max-w-[65ch]">
                  {movieData.Plot}
                </p>
              </section>
            )}

            {movieData.Awards && (
              <div className="flex items-center gap-3 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                <Trophy className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
                <span className="font-medium">{movieData.Awards}</span>
              </div>
            )}

            {/* Credits Stack — suppresses any empty / N/A line (F3) */}
            <section
              aria-label="Cast and crew credits"
              className="border-t border-zinc-200/80 dark:border-white/[0.08]"
            >
              {renderCreditRow('Director', movieData.Directors, true)}
              {renderCreditRow('Writers', movieData.Writers, false)}
              {renderCreditRow('Principal Cast', movieData.Actors, true)}
            </section>

            {/* Editorial Specification Ledger — replaces nested boxed cards */}
            {metadataFacts.length > 0 && (
              <section aria-label="Additional details" className="pt-2">
                <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 mb-4">
                  Production &amp; Release Specifications
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5 border-t border-zinc-200/80 dark:border-white/[0.08] pt-4">
                  {metadataFacts.map(({ label, value, isMono }) => (
                    <div key={label} className="min-w-0">
                      <dt className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                        {label}
                      </dt>
                      <dd
                        className={`text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-words ${
                          isMono ? 'font-mono tabular-nums' : ''
                        }`}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Embeddable Trailer Modal (F8) */}
      {showTrailerModal && movieData.TrailerKey && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${movieData.Title} Official Trailer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="w-full max-w-4xl rounded-2xl overflow-hidden bg-[#0c0c0e] border border-white/15 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 text-white">
              <h3 className="font-display font-bold text-base">
                {movieData.Title} ({movieData.Year}) — Official Trailer
              </h3>
              <button
                type="button"
                onClick={() => setShowTrailerModal(false)}
                aria-label="Close trailer modal"
                className="rounded-lg px-2.5 py-1 text-sm text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                title={`${movieData.Title} Trailer`}
                src={`https://www.youtube-nocookie.com/embed/${movieData.TrailerKey}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default MovieDetails;
