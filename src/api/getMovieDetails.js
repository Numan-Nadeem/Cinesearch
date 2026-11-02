import { getProviderAdapter } from './provider.js';

/**
 * React Router loader & direct fetcher for movie details.
 * Throws a typed ApiError on not-found, quota, network, or upstream errors (CS-01).
 */
export const getMoviesDetails = async ({ params, request }) => {
  const adapter = getProviderAdapter();
  return adapter.details(params?.movieID, { signal: request?.signal });
};
