import { getProviderAdapter } from './provider.js';

/**
 * Searches movies through the active provider adapter.
 */
export const getMoviesData = async (
  searchTerm,
  year = '',
  type = 'All',
  page = 1,
  options = {}
) => {
  const adapter = getProviderAdapter(options.provider);
  return adapter.search(
    {
      term: searchTerm,
      year,
      type,
      page,
    },
    options
  );
};
