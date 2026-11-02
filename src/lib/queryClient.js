import { QueryClient } from '@tanstack/react-query';

const SESSION_CACHE_KEY = 'cinesearch:query-cache-v2';
const MAX_CACHED_QUERIES = 40;
const STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes (F4)
const GC_TIME_MS = 30 * 60 * 1000; // 30 minutes (F4)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error?.retryable === false ||
          error?.kind === 'quota' ||
          error?.kind === 'not-found'
        ) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
    },
  },
});

/**
 * Hydrates bounded query cache from sessionStorage unless hard reload occurred (F4).
 */
export function initQueryCachePersistence(client = queryClient) {
  if (typeof window === 'undefined' || !window.sessionStorage) return;

  try {
    const navEntry = window.performance?.getEntriesByType?.('navigation')?.[0];
    if (navEntry && navEntry.type === 'reload') {
      window.sessionStorage.removeItem(SESSION_CACHE_KEY);
    } else {
      const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
      if (raw) {
        const entries = JSON.parse(raw);
        if (Array.isArray(entries)) {
          const now = Date.now();
          for (const entry of entries) {
            if (
              entry?.queryKey &&
              entry?.data !== undefined &&
              now - (entry.dataUpdatedAt || 0) < STALE_TIME_MS
            ) {
              client.setQueryData(entry.queryKey, entry.data, {
                updatedAt: entry.dataUpdatedAt,
              });
            }
          }
        }
      }
    }
  } catch {
    // Ignore corrupt session cache
  }

  client.getQueryCache().subscribe(() => {
    try {
      const allQueries = client
        .getQueryCache()
        .getAll()
        .filter((q) => q.state.status === 'success' && q.state.data !== undefined)
        .slice(-MAX_CACHED_QUERIES)
        .map((q) => ({
          queryKey: q.queryKey,
          data: q.state.data,
          dataUpdatedAt: q.state.dataUpdatedAt,
        }));
      window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(allQueries));
    } catch {
      // Storage quota full — ignore safely
    }
  });
}
