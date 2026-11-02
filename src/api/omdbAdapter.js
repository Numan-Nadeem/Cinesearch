import { ApiError, classifyApiError } from './errors.js';
import {
  normalizeMovieSummary,
  normalizeMovieDetails,
  resolveImageUrl,
} from './normalize.js';
import {
  searchFallbackMovies,
  getFallbackMovieDetails,
  getFallbackTrending,
  AVAILABLE_GENRES,
} from './mockMovies.js';

export const omdbAdapter = {
  id: 'omdb',
  name: 'OMDb API',

  /**
   * Resolves image URL for OMDb poster strings (suppressing "N/A").
   */
  image(rawUrl, size = 'grid') {
    return resolveImageUrl(rawUrl, size);
  },

  /**
   * Searches movies/series via /.netlify/functions/omdb-proxy and returns PagedResults.
   * @param {{ term: string, year?: string, type?: string, page?: number }} params
   * @param {{ signal?: AbortSignal }} [options]
   */
  async search({ term, year = '', type = 'All', page = 1 }, options = {}) {
    const cleanTerm = (term || '').trim();
    if (!cleanTerm) {
      return {
        items: [],
        totalResults: 0,
        page: 1,
        hasMore: false,
      };
    }

    const searchParams = new URLSearchParams({
      searchTerm: cleanTerm,
      page: String(page),
    });
    if (year) searchParams.append('year', String(year).trim());
    if (type && type !== 'All') searchParams.append('type', type.toLowerCase());

    let data;
    try {
      const res = await fetch(
        `/.netlify/functions/omdb-proxy?${searchParams.toString()}`,
        { signal: options.signal }
      );
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw classifyApiError(res.status, body);
      }
      data = body;
    } catch (err) {
      if (err?.name === 'AbortError' || err instanceof ApiError) {
        throw err;
      }
      // If local dev proxy was unreachable, fall back to deterministic dataset unless quota test
      data = searchFallbackMovies(cleanTerm, year, type, page);
    }

    if (data?.Response === 'False') {
      const apiErr = classifyApiError(200, data);
      if (apiErr.kind === 'not-found') {
        return {
          items: [],
          totalResults: 0,
          page: Number(page) || 1,
          hasMore: false,
        };
      }
      throw apiErr;
    }

    const rawItems = Array.isArray(data?.Search) ? data.Search : [];
    const items = rawItems.map((item) => normalizeMovieSummary(item)).filter(Boolean);
    const totalResults = parseInt(data?.totalResults, 10) || items.length;
    const currentPage = Number(page) || 1;
    const totalPages = Math.ceil(totalResults / 10);

    return {
      items,
      totalResults,
      page: currentPage,
      hasMore: currentPage < totalPages,
    };
  },

  /**
   * Fetches full details by IMDb ID via /.netlify/functions/omdb-proxy.
   * Throws a typed ApiError on not-found, quota, network, or upstream failures (CS-01).
   */
  async details(movieID, options = {}) {
    const id = (movieID || '').trim();
    if (!id) {
      throw new ApiError('Movie ID is required.', 'not-found', 404);
    }

    let data;
    try {
      const res = await fetch(
        `/.netlify/functions/omdb-proxy?movieID=${encodeURIComponent(id)}`,
        { signal: options.signal }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw classifyApiError(res.status, body);
      }
      data = body;
    } catch (err) {
      if (err?.name === 'AbortError' || err instanceof ApiError) {
        throw err;
      }
      data = getFallbackMovieDetails(id);
    }

    if (!data || data.Response === 'False') {
      throw classifyApiError(404, data || { Error: 'Title not found.' });
    }

    return normalizeMovieDetails(data);
  },

  /**
   * Returns curated trending & genre discovery list.
   */
  async trending(genre = '') {
    const list = getFallbackTrending(genre);
    return list.map((item) => normalizeMovieSummary(item)).filter(Boolean);
  },

  genres() {
    return AVAILABLE_GENRES;
  },
};
