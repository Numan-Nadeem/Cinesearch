import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { normalizeMovieSummary } from '../api/normalize.js';

const WATCHLIST_STORAGE_KEY = 'cinesearch:watchlist';
const MAX_WATCHLIST_ITEMS = 300;

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [items, setItems] = useLocalStorage(WATCHLIST_STORAGE_KEY, []);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, undoItem = null) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: Date.now(),
      message,
      undoItem,
    });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast(null);
  }, []);

  const isInWatchlist = useCallback(
    (imdbID) => {
      if (!imdbID || !Array.isArray(items)) return false;
      return items.some((entry) => entry.imdbID === imdbID);
    },
    [items]
  );

  const addToWatchlist = useCallback(
    (movie) => {
      const summary = normalizeMovieSummary(movie);
      if (!summary || !summary.imdbID) return;

      setItems((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        if (list.some((item) => item.imdbID === summary.imdbID)) {
          return list;
        }
        const entry = {
          ...summary,
          addedAt: new Date().toISOString(),
        };
        return [entry, ...list].slice(0, MAX_WATCHLIST_ITEMS);
      });

      showToast(`Added "${summary.Title}" to Watchlist`);
    },
    [setItems, showToast]
  );

  const removeFromWatchlist = useCallback(
    (imdbID) => {
      if (!imdbID) return;
      let removedEntry = null;

      setItems((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        removedEntry = list.find((item) => item.imdbID === imdbID) || null;
        return list.filter((item) => item.imdbID !== imdbID);
      });

      if (removedEntry) {
        showToast(`Removed "${removedEntry.Title}" from Watchlist`, removedEntry);
      }
    },
    [setItems, showToast]
  );

  const toggleWatchlist = useCallback(
    (movie) => {
      const imdbID = movie?.imdbID || movie?.id;
      if (!imdbID) return;
      if (isInWatchlist(imdbID)) {
        removeFromWatchlist(imdbID);
      } else {
        addToWatchlist(movie);
      }
    },
    [isInWatchlist, removeFromWatchlist, addToWatchlist]
  );

  const undoRemove = useCallback(() => {
    if (!toast?.undoItem) return;
    const itemToRestore = toast.undoItem;
    setItems((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      if (list.some((i) => i.imdbID === itemToRestore.imdbID)) return list;
      return [itemToRestore, ...list].slice(0, MAX_WATCHLIST_ITEMS);
    });
    showToast(`Restored "${itemToRestore.Title}" to Watchlist`);
  }, [toast, setItems, showToast]);

  const clearWatchlist = useCallback(() => {
    setItems([]);
    showToast('Cleared Watchlist');
  }, [setItems, showToast]);

  const exportWatchlistJson = useCallback(() => {
    const payload = {
      app: 'CineSearch',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      items: Array.isArray(items) ? items : [],
    };
    return JSON.stringify(payload, null, 2);
  }, [items]);

  const importWatchlistJson = useCallback(
    (jsonText) => {
      const parsed = JSON.parse(jsonText);
      const rawArray = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.items)
          ? parsed.items
          : null;

      if (!rawArray) {
        throw new Error('Invalid Watchlist JSON format');
      }

      const validEntries = rawArray
        .map((raw) => {
          const normalized = normalizeMovieSummary(raw);
          if (!normalized || !normalized.imdbID) return null;
          return {
            ...normalized,
            addedAt: raw.addedAt || new Date().toISOString(),
          };
        })
        .filter(Boolean);

      setItems((prev) => {
        const existing = Array.isArray(prev) ? prev : [];
        const map = new Map();
        for (const item of [...validEntries, ...existing]) {
          if (!map.has(item.imdbID)) {
            map.set(item.imdbID, item);
          }
        }
        return Array.from(map.values()).slice(0, MAX_WATCHLIST_ITEMS);
      });

      showToast(`Imported ${validEntries.length} title(s) into Watchlist`);
      return validEntries.length;
    },
    [setItems, showToast]
  );

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const value = useMemo(
    () => ({
      items: safeItems,
      count: safeItems.length,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      undoRemove,
      clearWatchlist,
      exportWatchlistJson,
      importWatchlistJson,
      toast,
      dismissToast,
      showToast,
    }),
    [
      safeItems,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      undoRemove,
      clearWatchlist,
      exportWatchlistJson,
      importWatchlistJson,
      toast,
      dismissToast,
      showToast,
    ]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-3 text-sm font-medium shadow-2xl border border-white/10 transition-all"
        >
          <span>{toast.message}</span>
          {toast.undoItem && (
            <button
              type="button"
              onClick={undoRemove}
              className="rounded-md bg-[#d93829]/25 px-2.5 py-1 text-xs font-semibold text-red-200 hover:bg-[#d93829]/40 focus:outline-none focus:ring-2 focus:ring-[#d93829] cursor-pointer"
            >
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="text-zinc-400 hover:text-white focus:outline-none cursor-pointer ml-1"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
