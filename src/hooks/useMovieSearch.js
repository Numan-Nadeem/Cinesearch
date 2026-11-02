import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { getProviderAdapter, getActiveProviderId } from '../api/provider.js';
import { useState, useEffect } from 'react';

export function useActiveProvider() {
  const [providerId, setProviderId] = useState(() => getActiveProviderId());

  useEffect(() => {
    const onProviderChange = (e) => {
      setProviderId(e.detail || getActiveProviderId());
    };
    window.addEventListener('cinesearch:provider-change', onProviderChange);
    return () => window.removeEventListener('cinesearch:provider-change', onProviderChange);
  }, []);

  return providerId;
}

/**
 * Infinite query hook for paginated movie search with AbortController support
 * and automatic request de-duplication (F4, CS-06).
 */
export function useMovieSearch({ term, year = '', type = 'All' }) {
  const providerId = useActiveProvider();
  const cleanTerm = (term || '').trim();
  const cleanYear = (year || '').trim();
  const cleanType = type || 'All';

  return useInfiniteQuery({
    queryKey: [providerId, 'search', { term: cleanTerm.toLowerCase(), year: cleanYear, type: cleanType }],
    enabled: Boolean(cleanTerm),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1, signal }) => {
      const adapter = getProviderAdapter(providerId);
      return adapter.search(
        {
          term: cleanTerm,
          year: cleanYear,
          type: cleanType,
          page: pageParam,
        },
        { signal }
      );
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.hasMore) return undefined;
      return lastPage.page + 1;
    },
  });
}

/**
 * Debounced autocomplete suggestion query with its own queryKey namespace
 * that reuses cached infinite-search pages when available so suggestions cost zero extra quota (F5).
 */
export function useSearchSuggestions(debouncedTerm, type = 'All') {
  const providerId = useActiveProvider();
  const queryClient = useQueryClient();
  const cleanTerm = (debouncedTerm || '').trim();
  const cleanType = type || 'All';

  return useQuery({
    queryKey: [providerId, 'suggestions', { term: cleanTerm.toLowerCase(), type: cleanType }],
    enabled: cleanTerm.length >= 3,
    queryFn: async ({ signal }) => {
      // Reuse cached search results if already fetched by useMovieSearch
      const cachedSearch = queryClient.getQueryData([
        providerId,
        'search',
        { term: cleanTerm.toLowerCase(), year: '', type: cleanType },
      ]);
      if (cachedSearch?.pages?.[0]?.items) {
        return cachedSearch.pages[0].items.slice(0, 8);
      }

      const adapter = getProviderAdapter(providerId);
      const page1 = await adapter.search(
        {
          term: cleanTerm,
          year: '',
          type: cleanType,
          page: 1,
        },
        { signal }
      );
      return (page1?.items || []).slice(0, 8);
    },
  });
}
