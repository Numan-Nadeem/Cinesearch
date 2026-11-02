import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import SearchBar from '../components/features/SearchBar.jsx';
import ResultGrid from '../components/features/ResultGrid.jsx';
import { ResultGridSkeleton } from '../components/ui/Skeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
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
 * URL-synced search page powered by TanStack Query useInfiniteQuery.
 */
const Movie = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive search state strictly from URL query parameters
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

  // Flatten paginated results and de-duplicate by imdbID
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
          <div className="px-5 sm:px-8 max-w-[1360px] mx-auto">
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
            <div className="max-w-[1360px] mx-auto px-5 sm:px-8 py-12">
              <EmptyState
                variant="no-results"
                title="No matching titles"
                description={`We couldn't find any entries matching "${query}"${
                  year ? ` released in ${year}` : ''
                }${type !== 'All' ? ` (${type})` : ''}. Try broadening your release year or content type filters.`}
                actionLabel="Reset Search Filters"
                onAction={() => setSearchParams(new URLSearchParams())}
              />
            </div>
          )
        ) : (
          <section
            aria-labelledby="starting-queries-heading"
            className="max-w-[1360px] mx-auto px-5 sm:px-8 py-16 animate-editorial-in"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#ebe6dc] dark:bg-[#151519] p-6 sm:p-10">
              <div className="lg:col-span-5">
                <h2
                  id="starting-queries-heading"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#161514] dark:text-white mb-3"
                >
                  Curated starting points.
                </h2>
                <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
                  Select a repertory preset to load immediate results, or type any title or director in the search bar above.
                </p>
              </div>
              <div className="lg:col-span-7 flex flex-wrap gap-3 lg:justify-end items-center">
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
                    className="bg-[#e2dcd0] dark:bg-[#1d1d23] hover:bg-[#c83a2b] hover:text-white px-5 py-3 text-xs font-semibold text-[#161514] dark:text-[#f2efe9] active:scale-[0.98] cursor-pointer transition-all whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Movie;
