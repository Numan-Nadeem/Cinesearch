import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Upload, Trash2, ArrowUpDown } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext.jsx';
import MovieCard from '../components/ui/MovieCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionKicker from '../components/ui/SectionKicker.jsx';
import { useDocumentMeta } from '../lib/seo.js';

/**
 * Local-first Watchlist page with zero API dependency, multi-key sorting,
 * JSON export/import, Escape-key modal dismissal, and undoable removals (F2, F7).
 */
const Watchlist = () => {
  const navigate = useNavigate();
  const {
    items,
    count,
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

  const filteredItems = useMemo(() => {
    const base = items.filter((item) => {
      if (typeFilter === 'All') return true;
      return (item.Type || 'movie').toLowerCase() === typeFilter.toLowerCase();
    });

    return [...base].sort((a, b) => {
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
      return 0; // 'recent' preserves insertion order
    });
  }, [items, typeFilter, sortBy]);

  return (
    <div className="max-w-7xl w-full mx-auto px-6 md:px-10 py-12 animate-editorial-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/90 dark:border-white/[0.08]">
        <div>
          <SectionKicker index="01" className="mb-1.5">
            Personal Collection · Offline Ready
          </SectionKicker>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            My Watchlist{' '}
            <span className="font-mono tabular-nums text-base font-medium text-zinc-500 dark:text-zinc-400">
              · {count} {count === 1 ? 'title' : 'titles'}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportDownload}
            disabled={count === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] px-4 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-white/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setImportError('');
              setShowImportModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] px-4 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-white/25 active:scale-[0.98] cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Import JSON</span>
          </button>
        </div>
      </div>

      {count > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 my-7">
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
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.98] cursor-pointer ${
                      active
                        ? 'bg-[#d93829] text-white font-semibold'
                        : 'bg-white dark:bg-[#141418] text-zinc-700 dark:text-zinc-300 border border-zinc-200/90 dark:border-white/[0.08] hover:border-zinc-400 dark:hover:border-white/20'
                    }`}
                  >
                    {type === 'All' ? 'All Saved' : type === 'series' ? 'Series' : 'Movies'}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <label htmlFor="watchlist-sort" className="text-xs text-zinc-500 dark:text-zinc-400">
                Sort by
              </label>
              <select
                id="watchlist-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] px-3 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#d93829]"
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
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#141418] py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#d93829] hover:border-[#d93829]/40 active:scale-[0.98] cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          variant="watchlist"
          title="Your Watchlist is Empty"
          description="Bookmark any film or series while browsing the catalogue. Saved titles persist locally in your browser for instant offline access."
          actionLabel="Explore the Catalogue"
          actionTo="/movies"
        />
      )}

      {/* Import Watchlist JSON Modal */}
      {showImportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-watchlist-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#f8f7f4] dark:bg-[#141418] p-6 shadow-2xl border border-zinc-200 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="import-watchlist-heading"
              className="font-display text-lg font-bold text-zinc-900 dark:text-white mb-2"
            >
              Import Watchlist JSON
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
              Upload a previously exported <code>cinesearch-watchlist.json</code> file or paste the JSON array below.
            </p>

            <div className="mb-4">
              <label
                htmlFor="watchlist-file-input"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Choose JSON File
              </label>
              <input
                id="watchlist-file-input"
                type="file"
                accept="application/json,.json"
                onChange={handleFileUpload}
                className="block w-full text-xs text-zinc-600 dark:text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#d93829] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#b82d20] cursor-pointer"
              />
            </div>

            <form onSubmit={handleImportSubmit}>
              <label
                htmlFor="watchlist-json-textarea"
                className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                Or Paste JSON Content
              </label>
              <textarea
                id="watchlist-json-textarea"
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"imdbID":"tt0468569","Title":"The Dark Knight","Year":"2008","Type":"movie"}]'
                className="w-full rounded-xl border border-zinc-300 dark:border-white/15 bg-white dark:bg-[#0c0c0e] p-3 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#d93829]"
              />

              {importError && (
                <p role="alert" className="mt-2 text-xs font-medium text-[#d93829]">
                  {importError}
                </p>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importText.trim()}
                  className="rounded-lg bg-[#d93829] px-5 py-2 text-xs font-semibold text-white hover:bg-[#b82d20] active:scale-[0.98] disabled:opacity-40 cursor-pointer transition-all"
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
