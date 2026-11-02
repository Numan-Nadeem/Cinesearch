import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import SearchBar from '../components/features/SearchBar.jsx';
import ResultGrid from '../components/features/ResultGrid.jsx';
import { ResultGridSkeleton } from '../components/ui/Skeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionKicker from '../components/ui/SectionKicker.jsx';
import { useMovieSearch } from '../hooks/useMovieSearch.js';
import { useDocumentMeta } from '../lib/seo.js';

const QUICK_SEARCH_PRESETS = [
  { label: 'Batman', query: 'batman', type: 'movie' },
  { label: 'Alien (1979)', query: 'alien', year: '1979', type: 'movie' },
  { label: 'Dune', query: 'dune', type: 'movie' },
  { label: 'Christopher Nolan', query: 'Christopher Nolan', type: 'All' },
  { label: 'Sci-Fi Series', query: 'stranger', type: 'series' },
  { label: 'Breaking Bad', query: 'breaking bad', type: 'series' },
];

/**
 * URL-synced search page powered by TanStack Query useInfiniteQuery (F1, F4, F5, CS-04, CS-05, CS-06, CS-23).
 */
const Movie = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive search state strictly from URL query parameters (F1)
  const query = (searchParams.get('query') || '').trim();
  const year = (searchParams.get('year') || '').trim();
  const type = searchParams.get('type') || 'All';

  useDocumentMeta({
    title: query
      ? `Search "${query}"${year ? ` (${year})` : ''} — Movies`
      : 'Search Movies & TV Shows',
    description: query
      ? `Browse CineSearch results for "${query}"${year ? ` released in ${year}` : ''}.`
      : 'Search thousands of movies, series, and episodes by title, release year, and content type.',
  });

  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useMovieSearch({
    term: query,
    year,
    type,
  });

  // Flatten paginated results and de-duplicate by imdbID (CS-06)
  const { items, totalResults } = useMemo(() => {
    if (!data?.pages || data.pages.length === 0) {
      return { items: [], totalResults: 0 };
    }
    const seen = new Set();
    const merged = [];
    for (const page of data.pages) {
      for (const item of page.items || []) {
        if (item?.imdbID && !seen.has(item.imdbID)) {
          seen.add(item.imdbID);
          merged.push(item);
        }
      }
    }
    const total = data.pages[0]?.totalResults ?? merged.length;
    return { items: merged, totalResults: total };
  }, [data]);

  const handleSearchSubmit = useCallback(
    ({ query: nextQuery, year: nextYear, type: nextType }) => {
      const nextParams = new URLSearchParams();
      if (nextQuery) nextParams.set('query', nextQuery);
      if (nextYear) nextParams.set('year', nextYear);
      if (nextType && nextType !== 'All') nextParams.set('type', nextType);
      setSearchParams(nextParams);
    },
    [setSearchParams]
  );

  const handleNavigateToMovie = useCallback(
    (imdbID) => {
      navigate(`/movies/${imdbID}`);
    },
    [navigate]
  );

  const hasSearched = Boolean(query);

  return (
    <div className="flex-1">
      <SearchBar
        initialQuery={query}
        initialYear={year}
        initialType={type}
        onSubmitSearch={handleSearchSubmit}
        onSelectMovie={handleNavigateToMovie}
      />

      <div className="min-h-[50dvh]">
        {isLoading ? (
          <ResultGridSkeleton count={8} />
        ) : isError ? (
          <div className="px-6">
            <ErrorState error={error} onRetry={() => refetch()} />
          </div>
        ) : hasSearched ? (
          items.length > 0 ? (
            <ResultGrid
              items={items}
              totalResults={totalResults}
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              onNavigateToMovie={handleNavigateToMovie}
              queryLabel={query}
            />
          ) : (
            <EmptyState
              variant="no-results"
              title="No titles matched your filter criteria"
              description={`We couldn't find any entries matching "${query}"${
                year ? ` released in ${year}` : ''
              }${type !== 'All' ? ` (${type})` : ''}. Try broadening your release year or content type filters.`}
              actionLabel="Reset Search Filters"
              onAction={() => setSearchParams(new URLSearchParams())}
            />
          )
        ) : (
          <div className="max-w-3xl mx-auto px-6 py-10 animate-editorial-in">
            <EmptyState
              variant="prompt"
              title="Search the Cinema Index"
              description="Enter a film title, director, or series above—or press / on your keyboard—to query the catalogue immediately."
            />

            <div className="mt-2 flex flex-col items-center">
              <SectionKicker index="02" className="mb-3">
                Curated Starting Points
              </SectionKicker>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_SEARCH_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      handleSearchSubmit({
                        query: preset.query,
                        year: preset.year || '',
                        type: preset.type || 'All',
                      })
                    }
                    className="rounded-lg border border-zinc-300/80 dark:border-white/10 bg-white dark:bg-[#141418] px-3.5 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-[#d93829] hover:text-[#d93829] dark:hover:text-[#e84a3b] active:scale-[0.98] cursor-pointer transition-all shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movie;
