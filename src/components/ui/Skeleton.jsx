/**
 * Skeleton loading placeholders matching the 2:3 aspect ratio and unboxed metadata row of MovieCard.
 */
export const MovieCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="rounded-xl overflow-hidden bg-white dark:bg-[#141418] border border-zinc-200/80 dark:border-white/[0.08] shadow-xs animate-pulse flex flex-col h-full"
  >
    <div className="aspect-[2/3] w-full bg-zinc-200 dark:bg-zinc-800/80" />
    <div className="p-4 flex flex-col gap-3 flex-1">
      <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
      <div className="mt-auto pt-2 border-t border-zinc-100 dark:border-white/[0.06] flex justify-between items-center">
        <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3.5 w-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  </div>
);

export const ResultGridSkeleton = ({ count = 8 }) => (
  <div
    role="status"
    aria-label="Loading movies"
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 md:px-10 py-10 max-w-7xl mx-auto"
  >
    {Array.from({ length: count }).map((_, idx) => (
      <MovieCardSkeleton key={idx} />
    ))}
    <span className="sr-only">Loading search results...</span>
  </div>
);
