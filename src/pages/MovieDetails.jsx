import { useState, useEffect } from 'react';
import { useLoaderData, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Play,
  ArrowSquareOut,
  X,
} from '@phosphor-icons/react';
import PosterArtwork from '../components/ui/PosterArtwork.jsx';
import RatingRow from '../components/ui/RatingRow.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import WatchlistButton from '../components/features/WatchlistButton.jsx';
import ShareRow from '../components/features/ShareRow.jsx';
import { useDocumentMeta } from '../lib/seo.js';

/**
 * Museum Accession Dossier page with multi-source Ratings ledger, suppressed N/A fields,
 * unboxed typographic metadata, drop-cap synopsis, dynamic SEO/OpenGraph tags, ShareRow,
 * Watchlist toggle, and Trailer modal.
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
      <div className="px-5 sm:px-8 py-12 max-w-[1360px] mx-auto">
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
      <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
        <span className="text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] min-w-36 shrink-0">
          {label}
        </span>
        <ul className="list-none flex flex-wrap items-center gap-y-1 text-sm font-medium text-[#161514] dark:text-[#f2efe9]">
          {values.map((val, idx) => (
            <li
              key={`${label}-${val}-${idx}`}
              className={idx !== 0 ? "before:content-['·'] before:mx-2 before:text-[#6b655e]" : ''}
            >
              {isInteractiveSearch ? (
                <Link
                  to={`/movies?query=${encodeURIComponent(val)}`}
                  className="hover:text-[#c83a2b] dark:hover:text-[#d94636] underline underline-offset-4 transition-colors"
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
    {
      label: 'Accession ID',
      value: movieData.imdbID ? `ACC. ${movieData.imdbID.toUpperCase()}` : null,
      isNumeric: true,
    },
    { label: 'Language', value: movieData.Language },
    { label: 'Country of Origin', value: movieData.Country },
    { label: 'Box Office Gross', value: movieData.BoxOffice, isNumeric: true },
    { label: 'Release Date', value: movieData.Released, isNumeric: true },
    { label: 'Production Studio', value: movieData.Production },
    { label: 'Home Media / DVD', value: movieData.DVD, isNumeric: true },
    {
      label: 'Total Seasons',
      value: movieData.totalSeasons ? `${movieData.totalSeasons} Seasons` : null,
      isNumeric: true,
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
    <article className="pb-24 pt-10 animate-editorial-in">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
        {/* Top Back Navigation & Accession Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-[#ebe6dc] dark:bg-[#151519] p-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-[#e2dcd0] dark:bg-[#1d1d23] hover:bg-[#c83a2b] hover:text-white px-4 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] cursor-pointer transition-all duration-150"
          >
            <ArrowLeft size={14} weight="bold" aria-hidden="true" />
            <span>Back to Results</span>
          </button>

          <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
            Acc. {String(movieData.imdbID || 'record')} · Archival dossier
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Poster Artwork + Primary Actions */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start">
            <figure className="w-64 sm:w-full max-w-[320px] aspect-[2/3] overflow-hidden bg-[#1b1b21]">
              <PosterArtwork
                src={movieData.Poster}
                title={movieData.Title}
                year={movieData.Year}
                eager={true}
                className="w-full h-full"
              />
            </figure>

            <div className="mt-5 w-64 sm:w-full max-w-[320px] flex flex-col gap-2.5">
              <WatchlistButton
                movie={movieData}
                variant="full"
                className="w-full justify-center"
              />

              {movieData.TrailerKey ? (
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] text-[#161514] dark:text-[#f2efe9] px-4 py-3 text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play size={16} weight="fill" className="text-[#c83a2b]" aria-hidden="true" />
                  <span>Watch Official Trailer</span>
                </button>
              ) : null}

              <a
                href={movieData.TrailerSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-4 py-2.5 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] hover:text-[#161514] dark:hover:text-white active:scale-[0.98] transition-all"
              >
                <ArrowSquareOut size={15} aria-hidden="true" />
                <span>Find Trailer on YouTube</span>
              </a>
            </div>
          </div>

          {/* Right Column: Editorial Dossier */}
          <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
            <header className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#161514] dark:text-white tracking-[-0.03em] leading-[1.03] mb-3">
                    {movieData.Title}
                  </h1>

                  {/* Unboxed typographic metadata line below heading */}
                  {metaParts.length > 0 && (
                    <p className="tabular-nums text-sm font-semibold text-[#c83a2b] dark:text-[#d94636]">
                      {metaParts.join(' · ')}
                    </p>
                  )}
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
                      className="bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#c83a2b] hover:text-white px-3.5 py-1.5 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              {/* Multi-Source Ratings Ledger: IMDb, Rotten Tomatoes, Metacritic */}
              <RatingRow
                ratings={movieData.Ratings}
                boxOffice={movieData.BoxOffice}
              />
            </header>

            {movieData.Plot && (
              <section aria-labelledby="synopsis-heading">
                <h2
                  id="synopsis-heading"
                  className="font-display text-xl font-bold text-[#161514] dark:text-white mb-3"
                >
                  Synopsis
                </h2>
                <p className="editorial-dropcap text-base sm:text-lg text-[#161514] dark:text-[#f2efe9] leading-relaxed max-w-[65ch]">
                  {movieData.Plot}
                </p>
              </section>
            )}

            {movieData.Awards && (
              <div className="flex items-center gap-3 bg-[#ebe6dc] dark:bg-[#151519] px-5 py-4 text-sm text-[#161514] dark:text-[#deb052]">
                <Trophy
                  size={18}
                  weight="duotone"
                  className="text-[#b87d24] dark:text-[#deb052] shrink-0"
                  aria-hidden="true"
                />
                <span className="font-medium">{movieData.Awards}</span>
              </div>
            )}

            {/* Credits Stack */}
            <section
              aria-labelledby="credits-heading"
              className="flex flex-col gap-2"
            >
              <h2
                id="credits-heading"
                className="font-display text-xl font-bold text-[#161514] dark:text-white mb-1"
              >
                Cast &amp; Crew
              </h2>
              {renderCreditRow('Director', movieData.Directors, true)}
              {renderCreditRow('Screenplay & Story', movieData.Writers, false)}
              {renderCreditRow('Principal Cast', movieData.Actors, true)}
            </section>

            {/* Editorial Specification Ledger */}
            {metadataFacts.length > 0 && (
              <section aria-labelledby="specs-heading" className="pt-2">
                <h2
                  id="specs-heading"
                  className="font-display text-xl font-bold text-[#161514] dark:text-white mb-4"
                >
                  Release Specifications
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {metadataFacts.map(({ label, value, isNumeric }) => (
                    <div
                      key={label}
                      className="min-w-0 bg-[#ebe6dc] dark:bg-[#151519] p-4"
                    >
                      <dt className="text-xs text-[#494540] dark:text-[#b5b0a8] mb-1">
                        {label}
                      </dt>
                      <dd
                        className={`text-sm font-semibold text-[#161514] dark:text-white break-words ${
                          isNumeric ? 'tabular-nums' : ''
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

      {/* Embeddable Trailer Modal */}
      {showTrailerModal && movieData.TrailerKey && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${movieData.Title} Official Trailer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden bg-[#0c0c0e] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#151519] text-white">
              <h3 className="font-display font-bold text-base">
                {movieData.Title} ({movieData.Year})
              </h3>
              <button
                type="button"
                onClick={() => setShowTrailerModal(false)}
                aria-label="Close trailer modal"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#b5b0a8] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X size={16} aria-hidden="true" />
                <span>Close</span>
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
