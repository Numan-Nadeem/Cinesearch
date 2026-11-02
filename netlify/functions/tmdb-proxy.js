import {
  searchFallbackMovies,
  getFallbackMovieDetails,
  getFallbackTrending,
} from '../../src/api/mockMovies.js';

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '*';
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

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
    action = '',
    genre = '',
    movieID,
    searchTerm,
    year = '',
    type = '',
    page = '1',
  } = event.queryStringParameters || {};

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

  if (action === 'trending') {
    const results = getFallbackTrending(genre);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ results }),
    };
  }

  if (movieID) {
    const details = getFallbackMovieDetails(movieID);
    const statusCode = details.Response === 'False' ? 404 : 200;
    return {
      statusCode,
      headers: corsHeaders,
      body: JSON.stringify(details),
    };
  }

  if (searchTerm) {
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

  return {
    statusCode: 400,
    headers: corsHeaders,
    body: JSON.stringify({
      error: 'Provide action=trending, movieID, or searchTerm',
    }),
  };
}
