export async function handler(event) {
  const ALLOWED_ORIGINS = ['https://cinesearchpk.netlify.app'];
  const origin = event.headers.origin;
  const corsHeaders = {
    'Content-Type': 'application/json',
    ...(ALLOWED_ORIGINS.includes(origin)
      ? { 'Access-Control-Allow-Origin': origin }
      : { 'Access-Control-Allow-Origin': 'null' }),
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

  const apiKey = process.env.VITE_MOVIE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'API key not configured on server' }),
    };
  }

  let omdbUrl;
  if (movieID) {
    omdbUrl = `https://www.omdbapi.com/?i=${encodeURIComponent(
      movieID
    )}&apikey=${encodeURIComponent(apiKey)}`;
  } else {
    omdbUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(
      searchTerm
    )}&page=${encodeURIComponent(page)}&apikey=${encodeURIComponent(apiKey)}`;
    if (year) omdbUrl += `&y=${encodeURIComponent(year)}`;
    if (type && type !== 'All') omdbUrl += `&type=${encodeURIComponent(type)}`;
  }

  try {
    const upstreamResp = await fetch(omdbUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!upstreamResp.ok) {
      const text = await upstreamResp.text();
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'OMDb upstream error',
          status: upstreamResp.status,
          details: text,
        }),
      };
    }

    const data = await upstreamResp.json();
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Request failed', details: err.message }),
    };
  }
}
