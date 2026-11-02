/**
 * Data model normalization and 'N/A' suppression utilities (Section 6.2, CS-03, F3, F8).
 */

/**
 * Returns null if a provider value is missing, whitespace-only, or literal "N/A".
 * @param {unknown} value
 * @returns {string | null}
 */
export function cleanField(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  if (!trimmed || trimmed.toUpperCase() === 'N/A') return null;
  return trimmed;
}

/**
 * Splits a comma-delimited string into an array of non-empty values, suppressing "N/A".
 * @param {unknown} value
 * @returns {string[]}
 */
export function splitListField(value) {
  const cleaned = cleanField(value);
  if (!cleaned) return [];
  return cleaned
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && item.toUpperCase() !== 'N/A');
}

/**
 * Resolves poster or backdrop URLs across OMDb and TMDB, suppressing "N/A" (CS-03, F8).
 * @param {string | null | undefined} rawUrl
 * @param {'grid' | 'detail' | 'backdrop'} [size='grid']
 * @returns {string | null}
 */
export function resolveImageUrl(rawUrl, size = 'grid') {
  const cleaned = cleanField(rawUrl);
  if (!cleaned) return null;

  // TMDB relative image path -> sized CDN variant (F8)
  if (cleaned.startsWith('/')) {
    const sizeMap = {
      grid: 'w342',
      detail: 'w780',
      backdrop: 'w1280',
    };
    const tmdbSize = sizeMap[size] || 'w342';
    return `https://image.tmdb.org/t/p/${tmdbSize}${cleaned}`;
  }

  // Upgrade Amazon/OMDb poster size when viewing detail page if applicable
  if (size === 'detail' && cleaned.includes('_V1_SX300')) {
    return cleaned.replace('_V1_SX300', '_V1_SX700');
  }

  return cleaned;
}

/**
 * Normalizes rating entries from OMDb Ratings array + top-level imdbRating / Metascore (F3).
 * Suppresses any source whose value is "N/A".
 */
export function normalizeRatings(raw) {
  if (!raw || typeof raw !== 'object') return [];

  const map = new Map();

  if (Array.isArray(raw.Ratings)) {
    for (const r of raw.Ratings) {
      const src = cleanField(r?.Source);
      const val = cleanField(r?.Value);
      if (!src || !val) continue;
      let label = src;
      if (src.toLowerCase().includes('internet movie database') || src.toLowerCase() === 'imdb') {
        label = 'IMDb';
      } else if (src.toLowerCase().includes('rotten tomatoes')) {
        label = 'Rotten Tomatoes';
      } else if (src.toLowerCase().includes('metacritic')) {
        label = 'Metacritic';
      }
      map.set(label, { source: label, value: val });
    }
  }

  const imdbRating = cleanField(raw.imdbRating);
  if (imdbRating && !map.has('IMDb')) {
    map.set('IMDb', {
      source: 'IMDb',
      value: imdbRating.includes('/') ? imdbRating : `${imdbRating}/10`,
    });
  }

  const metascore = cleanField(raw.Metascore);
  if (metascore && !map.has('Metacritic')) {
    map.set('Metacritic', {
      source: 'Metacritic',
      value: metascore.includes('/') ? metascore : `${metascore}/100`,
    });
  }

  // Ensure consistent ordering: IMDb, Rotten Tomatoes, Metacritic, then others
  const order = ['IMDb', 'Rotten Tomatoes', 'Metacritic'];
  return Array.from(map.values()).sort((a, b) => {
    const idxA = order.indexOf(a.source);
    const idxB = order.indexOf(b.source);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.source.localeCompare(b.source);
  });
}

/**
 * Normalizes a summary movie record for grids, search suggestions, and watchlist.
 */
export function normalizeMovieSummary(raw) {
  if (!raw) return null;
  const imdbID = cleanField(raw.imdbID) || cleanField(raw.id);
  const Title = cleanField(raw.Title) || cleanField(raw.title) || 'Untitled';
  const Year = cleanField(raw.Year) || cleanField(raw.release_date?.slice(0, 4)) || 'Unknown';
  const rawType = cleanField(raw.Type) || cleanField(raw.media_type) || 'movie';
  const Type = rawType.toLowerCase();
  const Poster = resolveImageUrl(raw.Poster ?? raw.poster_path, 'grid');
  const imdbRating = cleanField(raw.imdbRating) || (raw.vote_average ? String(Number(raw.vote_average).toFixed(1)) : null);
  const Genre = cleanField(raw.Genre);

  return {
    imdbID,
    Title,
    Year,
    Type,
    Poster,
    imdbRating,
    Genre,
  };
}

/**
 * Normalizes a full movie/series details record (Section 6.2, F3, F8).
 */
export function normalizeMovieDetails(raw) {
  if (!raw) return null;

  const Title = cleanField(raw.Title) || cleanField(raw.title) || 'Untitled';
  const Year = cleanField(raw.Year) || cleanField(raw.release_date?.slice(0, 4));
  const imdbID = cleanField(raw.imdbID) || cleanField(raw.id);
  const Type = (cleanField(raw.Type) || 'movie').toLowerCase();
  const Rated = cleanField(raw.Rated);
  const Released = cleanField(raw.Released);
  const Runtime = cleanField(raw.Runtime) || (raw.runtime ? `${raw.runtime} min` : null);
  const Genres = Array.isArray(raw.Genres)
    ? raw.Genres.filter(Boolean)
    : Array.isArray(raw.genres)
      ? raw.genres.map((g) => g.name || g).filter(Boolean)
      : splitListField(raw.Genre);
  const Genre = Genres.length > 0 ? Genres.join(', ') : null;
  const Plot = cleanField(raw.Plot) || cleanField(raw.overview);

  const Directors = splitListField(raw.Director);
  const Writers = splitListField(raw.Writer);
  const Actors = splitListField(raw.Actors);

  const Director = Directors.length > 0 ? Directors.join(', ') : null;
  const Writer = Writers.length > 0 ? Writers.join(', ') : null;
  const ActorsStr = Actors.length > 0 ? Actors.join(', ') : null;

  const Ratings = normalizeRatings(raw);
  const imdbRating = cleanField(raw.imdbRating);
  const Metascore = cleanField(raw.Metascore);
  const BoxOffice = cleanField(raw.BoxOffice);
  const Awards = cleanField(raw.Awards);
  const Language = cleanField(raw.Language);
  const Country = cleanField(raw.Country);
  const Production = cleanField(raw.Production);
  const DVD = cleanField(raw.DVD);
  const totalSeasons = cleanField(raw.totalSeasons);

  const Poster = resolveImageUrl(raw.Poster ?? raw.poster_path, 'detail');
  const Backdrop = resolveImageUrl(raw.Backdrop ?? raw.backdrop_path, 'backdrop');

  const Cast = Array.isArray(raw.Cast)
    ? raw.Cast
    : Actors.map((name, idx) => ({
        id: `cast-${idx}-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        character: null,
      }));

  const TrailerKey = cleanField(raw.TrailerKey);
  const TrailerSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${Title} ${Year || ''} official trailer`.trim()
  )}`;

  return {
    imdbID,
    Title,
    Year,
    Type,
    Rated,
    Released,
    Runtime,
    Genres,
    Genre,
    Plot,
    Directors,
    Writers,
    Actors,
    Director,
    Writer,
    ActorsList: Actors,
    Ratings,
    imdbRating,
    Metascore,
    BoxOffice,
    Awards,
    Language,
    Country,
    Production,
    DVD,
    totalSeasons,
    Poster,
    Backdrop,
    Cast,
    TrailerKey,
    TrailerSearchUrl,
  };
}
