import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReleaseYear } from '../lib/validation.js';
import {
  cleanField,
  resolveImageUrl,
  normalizeRatings,
  normalizeMovieSummary,
  normalizeMovieDetails,
} from './normalize.js';
import { ApiError, classifyApiError } from './errors.js';
import {
  searchFallbackMovies,
  getFallbackMovieDetails,
  getFallbackTrending,
} from './mockMovies.js';
import {
  computeWeightedConsensus,
  ARCHIVAL_CONSENSUS_PRINTS,
} from '../lib/consensus.js';

test('validateReleaseYear accepts empty or valid 4-digit years between 1880 and currentYear', () => {
  assert.deepEqual(validateReleaseYear('', 2026), { valid: true, error: '' });
  assert.deepEqual(validateReleaseYear('1979', 2026), { valid: true, error: '' });
  assert.deepEqual(validateReleaseYear('2026', 2026), { valid: true, error: '' });
  assert.equal(validateReleaseYear('1879', 2026).valid, false);
  assert.equal(validateReleaseYear('2027', 2026).valid, false);
  assert.equal(validateReleaseYear('99', 2026).valid, false);
});

test('cleanField and resolveImageUrl suppress literal "N/A" and empty values (CS-03)', () => {
  assert.equal(cleanField('N/A'), null);
  assert.equal(cleanField(' n/a '), null);
  assert.equal(cleanField(''), null);
  assert.equal(cleanField(null), null);
  assert.equal(cleanField('Christopher Nolan'), 'Christopher Nolan');

  assert.equal(resolveImageUrl('N/A', 'grid'), null);
  assert.equal(
    resolveImageUrl('/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'grid'),
    'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  );
  assert.equal(
    resolveImageUrl('/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'detail'),
    'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg'
  );
});

test('normalizeRatings formats and orders IMDb, Rotten Tomatoes, and Metacritic while suppressing N/A (F3)', () => {
  const ratings = normalizeRatings({
    Ratings: [
      { Source: 'Metacritic', Value: '84/100' },
      { Source: 'Internet Movie Database', Value: '9.0/10' },
      { Source: 'Rotten Tomatoes', Value: '94%' },
    ],
    imdbRating: '9.0',
    Metascore: 'N/A',
  });

  assert.equal(ratings.length, 3);
  assert.deepEqual(ratings.map((r) => r.source), [
    'IMDb',
    'Rotten Tomatoes',
    'Metacritic',
  ]);
});

test('normalizeMovieDetails suppresses N/A metadata fields and constructs YouTube trailer search URL (F3, CS-03)', () => {
  const details = normalizeMovieDetails({
    imdbID: 'tt18412256',
    Title: 'Alien: Romulus',
    Year: '2024',
    Poster: 'N/A',
    DVD: 'N/A',
    BoxOffice: '$105,313,091',
    Genre: 'Horror, Sci-Fi',
    Director: 'Fede Álvarez',
  });

  assert.equal(details.Poster, null);
  assert.equal(details.DVD, null);
  assert.equal(details.BoxOffice, '$105,313,091');
  assert.deepEqual(details.Genres, ['Horror', 'Sci-Fi']);
  assert.ok(details.TrailerSearchUrl.includes('Alien%3A%20Romulus'));
});

test('classifyApiError maps quota (429), not-found (404), network (0), and upstream (502) accurately (F4, CS-04)', () => {
  const quotaErr = classifyApiError(429, { Error: 'Request limit reached!' });
  assert.ok(quotaErr instanceof ApiError);
  assert.equal(quotaErr.kind, 'quota');
  assert.equal(quotaErr.retryable, false);

  const notFoundErr = classifyApiError(404, { Error: 'Incorrect IMDb ID.' });
  assert.equal(notFoundErr.kind, 'not-found');
  assert.equal(notFoundErr.retryable, false);

  const netErr = classifyApiError(new TypeError('Failed to fetch'));
  assert.equal(netErr.kind, 'network');
  assert.equal(netErr.retryable, true);

  const upstreamErr = classifyApiError(502, { error: 'Bad gateway' });
  assert.equal(upstreamErr.kind, 'upstream');
  assert.equal(upstreamErr.retryable, true);
});

test('searchFallbackMovies and getFallbackMovieDetails handle filters, missing posters, and invalid IDs (CS-01, F1)', () => {
  const alien1979 = searchFallbackMovies('alien', '1979', 'movie', 1);
  assert.equal(alien1979.Response, 'True');
  assert.equal(alien1979.Search.length, 1);
  assert.equal(alien1979.Search[0].Title, 'Alien');

  const romulus = getFallbackMovieDetails('tt18412256');
  const normalizedRomulus = normalizeMovieSummary(romulus);
  assert.equal(normalizedRomulus.Poster, null);

  const invalid = getFallbackMovieDetails('tt_invalid_id_999');
  assert.equal(invalid.Response, 'False');

  const trendingSciFi = getFallbackTrending('Sci-Fi');
  assert.ok(trendingSciFi.length > 0);
});

test('computeWeightedConsensus calculates audience, critic mean, and weighted consensus accurately', () => {
  const darkKnight = ARCHIVAL_CONSENSUS_PRINTS[0]; // audience 90, RT 94, MC 84 -> criticMean 89
  const atAudience = computeWeightedConsensus(darkKnight, 0);
  assert.equal(atAudience.weightedScore, 90);
  assert.equal(atAudience.criticMean, 89);
  assert.equal(atAudience.verdict, 'Locked Consensus');

  const parasite = ARCHIVAL_CONSENSUS_PRINTS[2]; // audience 85, RT 99, MC 97 -> criticMean 98
  const atCritics = computeWeightedConsensus(parasite, 100);
  assert.equal(atCritics.weightedScore, 98);
  assert.equal(atCritics.spread, 13);
  assert.equal(atCritics.verdict, 'Critics +13 pts');
});
