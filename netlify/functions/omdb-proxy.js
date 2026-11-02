import {
  searchFallbackMovies,
  getFallbackMovieDetails,
} from '../../src/api/mockMovies.js';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://cinesearchpk.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8888',
];

function getCorsHeaders(requestOrigin) {
  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowlist = configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;

  const isAllowed =
    !requestOrigin ||
    allowlist.includes('*') ||
    allowlist.includes(requestOrigin) ||
    requestOrigin.endsWith('.netlify.app') ||
    requestOrigin.endsWith('.run.app') ||
    requestOrigin.startsWith('http://localhost:');

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': isAllowed ? requestOrigin || '*' : allowlist[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };
}

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const corsHeaders = getCorsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  const {
    movieID,
    searchTerm,
    year = '',
    type = '',
    page = '1',
  } = event.queryStringParameters || {};

  if (!movieID && !searchTerm) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Either "movieID" or "searchTerm" query parameter is required',
      }),
    };
  }

  // Deterministic quota simulation for testing (F4)
  if (searchTerm === '__quota__' || movieID === 'tt_quota') {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({
        Response: 'False',
        Error: 'Request limit reached!',
      }),
    };
  }

  // Un-prefixed server-only secret OMDB_API_KEY (CS-09)
  const apiKey = process.env.OMDB_API_KEY || process.env.MOVIE_API_KEY;

  if (apiKey) {
    let omdbUrl;
    if (movieID) {
      omdbUrl = `https://www.omdbapi.com/?i=${encodeURIComponent(
        movieID
      )}&plot=full&apikey=${encodeURIComponent(apiKey)}`;
    } else {
      omdbUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(
        searchTerm
      )}&page=${encodeURIComponent(page)}&apikey=${encodeURIComponent(apiKey)}`;
      if (year) omdbUrl += `&y=${encodeURIComponent(year)}`;
      if (type && type !== 'All') omdbUrl += `&type=${encodeURIComponent(type)}`;
    }

    try {
      const upstreamResp = await fetch(omdbUrl, {
        headers: { Accept: 'application/json' },
      });

      const data = await upstreamResp.json().catch(() => null);

      if (
        upstreamResp.status === 401 ||
        upstreamResp.status === 429 ||
        String(data?.Error || '')
          .toLowerCase()
          .includes('limit reached')
      ) {
        return {
          statusCode: 429,
          headers: corsHeaders,
          body: JSON.stringify({
            Response: 'False',
            Error: data?.Error || 'Request limit reached!',
          }),
        };
      }

      if (upstreamResp.ok && data) {
        if (movieID && data.Response === 'False') {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify(data),
          };
        }
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(data),
        };
      }
    } catch (err) {
      console.warn('OMDb upstream request failed, using fallback:', err.message);
    }
  }

  // Fallback dataset when OMDB_API_KEY is not configured
  if (movieID) {
    const details = getFallbackMovieDetails(movieID);
    const statusCode = details.Response === 'False' ? 404 : 200;
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify(details),
    };
  }

  const results = searchFallbackMovies(
    searchTerm,
    year,
    type,
    parseInt(page, 10) || 1
  );
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(results),
  };
}
