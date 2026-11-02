import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DownloadSimple,
  UploadSimple,
  Trash,
  ArrowsDownUp,
  Plus,
  ArrowLeft,
} from '@phosphor-icons/react';
import { useWatchlist } from '../context/WatchlistContext.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useDocumentMeta } from '../lib/seo.js';

const REPERTORY_STARTERS = [
  {
    imdbID: 'tt0468569',
    Title: 'The Dark Knight',
    Year: '2008',
    Type: 'movie',
    Genre: 'Action, Crime, Drama',
    imdbRating: '9.0',
    Poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Type: 'movie',
    Genre: 'Drama, Thriller',
    imdbRating: '8.5',
    Poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
  },
  {
    imdbID: 'tt0078748',
    Title: 'Alien',
    Year: '1979',
    Type: 'movie',
    Genre: 'Horror, Sci-Fi',
    imdbRating: '8.5',
    Poster: 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
  },
];

/**
 * Local-first Watchlist Vault page with zero API dependency, collection analytics strip,
 * multi-key sorting, JSON export/import, Escape-key modal dismissal, and undoable removals.
 */
const Watchlist = () => {
  const navigate = useNavigate();
  const {
    items,
    count,
    addToWatchlist,
    removeFromWatchlist,
    exportWatchlistJson,
    importWatchlistJson,
    showToast,
  } = useWatchlist();

  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  useDocumentMeta({
    title: `My Watchlist (${count})`,
    description:
      'Manage your personal saved movies and TV series on CineSearch. Stored locally on your device for instant offline access.',
  });

  useEffect(() => {
    if (!showImportModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowImportModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showImportModal]);

  const handleExportDownload = () => {
    const json = exportWatchlistJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cinesearch-watchlist.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported Watchlist as JSON');
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    try {
      setImportError('');
      importWatchlistJson(importText);
      setImportText('');
      setShowImportModal(false);
    } catch (err) {
      setImportError(err.message || 'Could not parse JSON. Ensure it is a valid Watchlist export.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setImportError('');
        importWatchlistJson(String(reader.result || ''));
        setShowImportModal(false);
      } catch (err) {
        setImportError(err.message || 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const { filteredItems, avgRating, movieCount, seriesCount } = useMemo(() => {
    let ratedSum = 0;
    let ratedTotal = 0;
    let mCount = 0;
    let sCount = 0;

    for (const item of items) {
      const r = parseFloat(item.imdbRating);
      if (!Number.isNaN(r) && r > 0) {
        ratedSum += r;
        ratedTotal += 1;
      }
      if ((item.Type || 'movie').toLowerCase() === 'series') {
        sCount += 1;
      } else {
        mCount += 1;
      }
    }

    const base = items.filter((item) => {
      if (typeFilter === 'All') return true;
      return (item.Type || 'movie').toLowerCase() === typeFilter.toLowerCase();
    });

    const sorted = [...base].sort((a, b) => {
      if (sortBy === 'title') {
        return (a.Title || '').localeCompare(b.Title || '');
      }
      if (sortBy === 'year') {
        const yearA = parseInt(a.Year, 10) || 0;
        const yearB = parseInt(b.Year, 10) || 0;
        return yearB - yearA;
      }
      if (sortBy === 'rating') {
        const rateA = parseFloat(a.imdbRating) || 0;
        const rateB = parseFloat(b.imdbRating) || 0;
        return rateB - rateA;
      }
      return 0;
    });

    return {
      filteredItems: sorted,
      avgRating: ratedTotal > 0 ? (ratedSum / ratedTotal).toFixed(1) : '—',
      movieCount: mCount,
      seriesCount: sCount,
    };
  }, [items, typeFilter, sortBy]);

  return (
    <div className="max-w-[1360px] w-full mx-auto px-5 sm:px-8 pt-10 pb-20 animate-editorial-in">
      <div className="mb-6">
        <Link
          to="/movies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          <span>Return to Catalogue Search</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#161514] dark:text-white tracking-[-0.03em] leading-[1.03] mb-2">
            Personal Watchlist
          </h1>
          <p className="tabular-nums text-base text-[#494540] dark:text-[#b5b0a8]">
            {count} {count === 1 ? 'saved title' : 'saved titles'} · Stored locally in your browser for offline access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportDownload}
            disabled={count === 0}
            className="inline-flex items-center gap-2 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-4 py-2.5 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all whitespace-nowrap"
          >
            <DownloadSimple size={15} weight="duotone" aria-hidden="true" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportError('');
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] px-4 py-2.5 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] cursor-pointer transition-all whitespace-nowrap"
          >
            <UploadSimple size={15} weight="duotone" aria-hidden="true" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {count > 0 ? (
        <>
          {/* Collection Summary Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
              <span className="block text-xs text-[#494540] dark:text-[#b5b0a8]">
                Total Saved
              </span>
              <span className="tabular-nums text-lg font-bold text-[#161514] dark:text-white">
                {count} {count === 1 ? 'Print' : 'Prints'}
              </span>
            </div>
            <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
              <span className="block text-xs text-[#494540] dark:text-[#b5b0a8]">
                Format Split
              </span>
              <span className="tabular-nums text-lg font-bold text-[#161514] dark:text-white">
                {movieCount} Movies · {seriesCount} Series
              </span>
            </div>
            <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
              <span className="block text-xs text-[#494540] dark:text-[#b5b0a8]">
                Mean IMDb Score
              </span>
              <span className="tabular-nums text-lg font-bold text-[#b87d24] dark:text-[#deb052]">
                {avgRating} / 10
              </span>
            </div>
            <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
              <span className="block text-xs text-[#494540] dark:text-[#b5b0a8]">
                Persistence
              </span>
              <span className="text-base font-bold text-[#161514] dark:text-white">
                Local Browser Vault
              </span>
            </div>
          </div>

          <div
            data-ui="watchlist-controls"
            className="flex flex-wrap items-center justify-between gap-4 my-7 bg-[#ebe6dc] dark:bg-[#151519] p-4"
          >
            <div
              role="group"
              aria-label="Filter watchlist by type"
              className="flex items-center gap-2"
            >
              {['All', 'movie', 'series'].map((type) => {
                const active = typeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    aria-pressed={active}
                    className={`px-4 py-2 text-xs font-semibold transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#c83a2b] text-white'
                        : 'bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#161514] dark:text-[#f2efe9] hover:bg-[#d5cec0] dark:hover:bg-[#26262e]'
                    }`}
                  >
                    {type === 'All' ? 'All Saved' : type === 'series' ? 'Series' : 'Movies'}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <ArrowsDownUp size={15} className="text-[#6b655e]" aria-hidden="true" />
              <label htmlFor="watchlist-sort" className="text-xs font-semibold text-[#494540] dark:text-[#b5b0a8]">
                Sort by
              </label>
              <select
                id="watchlist-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#f5f2eb] dark:bg-[#0c0c0e] px-3 py-2 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] focus:outline-none focus:ring-2 focus:ring-[#c83a2b]"
              >
                <option value="recent">Recently Added</option>
                <option value="rating">IMDb Rating</option>
                <option value="year">Release Year</option>
                <option value="title">Title (A–Z)</option>
              </select>
            </div>
          </div>

          <div
            data-testid="watchlist-grid"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredItems.map((movie) => (
              <div key={movie.imdbID} className="flex flex-col gap-2">
                <MovieCard
                  curMovie={movie}
                  navigateToMovie={() => navigate(`/movies/${movie.imdbID}`)}
                />
                <button
                  type="button"
                  onClick={() => removeFromWatchlist(movie.imdbID)}
                  aria-label={`Remove ${movie.Title} from watchlist`}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#c83a2b] hover:text-white py-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] active:scale-[0.98] cursor-pointer transition-all"
                >
                  <Trash size={14} aria-hidden="true" />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch py-6">
          <div className="lg:col-span-6">
            <EmptyState
              variant="watchlist"
              title="Watchlist is empty"
              description="Bookmark any film or series while browsing the catalogue. Saved titles persist locally in your browser for instant offline access."
              actionLabel="Explore the Catalogue"
              actionTo="/movies"
            />
          </div>

          <div className="lg:col-span-6 bg-[#ebe6dc] dark:bg-[#151519] p-8 flex flex-col justify-center">
            <h2 className="font-display text-2xl font-bold text-[#161514] dark:text-white mb-3">
              Archival starters
            </h2>
            <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed mb-6">
              Populate your local screening room in one click with three landmark repertory prints.
            </p>
            <div className="flex flex-wrap gap-3">
              {REPERTORY_STARTERS.map((starter) => (
                <button
                  key={starter.imdbID}
                  type="button"
                  onClick={() => addToWatchlist(starter)}
                  className="inline-flex items-center gap-2 bg-[#e2dcd0] dark:bg-[#1d1d23] hover:bg-[#c83a2b] hover:text-white px-4 py-2.5 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] cursor-pointer transition-all"
                >
                  <Plus size={13} weight="bold" aria-hidden="true" />
                  <span className="tabular-nums">
                    {starter.Title} ({starter.Year})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import Watchlist JSON Modal */}
      {showImportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-watchlist-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#f5f2eb] dark:bg-[#151519] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="import-watchlist-heading"
              className="font-display text-xl font-bold text-[#161514] dark:text-white mb-2"
            >
              Import Watchlist JSON
            </h2>
            <p className="text-xs text-[#494540] dark:text-[#b5b0a8] mb-4">
              Upload a previously exported <code>cinesearch-watchlist.json</code> file or paste the JSON array below.
            </p>

            <div className="mb-4">
              <label
                htmlFor="watchlist-file-input"
                className="block text-xs font-semibold text-[#161514] dark:text-[#f2efe9] mb-1.5"
              >
                Choose JSON File
              </label>
              <input
                id="watchlist-file-input"
                type="file"
                accept="application/json,.json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-[#494540] dark:text-[#b5b0a8] file:mr-3 file:border-0 file:bg-[#c83a2b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#a92e21] cursor-pointer"
              />
            </div>

            <form onSubmit={handleImportSubmit}>
              <label
                htmlFor="watchlist-json-textarea"
                className="block text-xs font-semibold text-[#161514] dark:text-[#f2efe9] mb-1.5"
              >
                Or Paste JSON Content
              </label>
              <textarea
                id="watchlist-json-textarea"
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"imdbID":"tt0468569","Title":"The Dark Knight","Year":"2008","Type":"movie"}]'
                className="w-full bg-[#ebe6dc] dark:bg-[#0c0c0e] p-3 text-xs text-[#161514] dark:text-[#f2efe9] focus:outline-none focus:ring-2 focus:ring-[#c83a2b]"
              />

              {importError && (
                <p role="alert" className="mt-2 text-xs font-semibold text-[#c83a2b]">
                  {importError}
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importText.trim()}
                  className="bg-[#c83a2b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#a92e21] active:scale-[0.98] disabled:opacity-40 cursor-pointer transition-all"
                >
                  Import Titles
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
