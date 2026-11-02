/**
 * Pure consensus calculation logic for the Live Repertory Consensus Comparator.
 * Weighs audience reception (IMDb 0-10 normalized to 0-100) against critical consensus
 * (mean of Rotten Tomatoes 0-100 and Metacritic 0-100) according to a criticWeight (0 to 100).
 */

export const ARCHIVAL_CONSENSUS_PRINTS = [
  {
    imdbID: 'tt0468569',
    Title: 'The Dark Knight',
    Year: '2008',
    Director: 'Christopher Nolan',
    Runtime: '152 min',
    Rated: 'PG-13',
    Type: 'movie',
    Genre: 'Action, Crime, Drama',
    Format: '70mm IMAX · 35mm Print',
    Poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    TrailerKey: 'EXeTwQWrcwY',
    imdbRating: '9.0',
    rottenTomatoes: '94%',
    metacritic: '84/100',
    audienceScore: 90,
    tomatometerScore: 94,
    metascore: 84,
    note: 'Near-unanimous acclaim where mass audience enthusiasm (90) slightly outpaces strict Metacritic weighting (84).',
  },
  {
    imdbID: 'tt15398776',
    Title: 'Oppenheimer',
    Year: '2023',
    Director: 'Christopher Nolan',
    Runtime: '180 min',
    Rated: 'R',
    Type: 'movie',
    Genre: 'Biography, Drama, History',
    Format: '70mm IMAX · 15-Perf Celluloid',
    Poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    TrailerKey: 'uYPbbksJxIg',
    imdbRating: '8.9',
    rottenTomatoes: '93%',
    metacritic: '90/100',
    audienceScore: 89,
    tomatometerScore: 93,
    metascore: 90,
    note: 'Tightly locked three-way alignment across audience polling (89), Tomatometer (93), and Metascore (90).',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Director: 'Bong Joon Ho',
    Runtime: '132 min',
    Rated: 'R',
    Type: 'movie',
    Genre: 'Drama, Thriller',
    Format: '2.39:1 Digital Intermediate · 35mm Archival',
    Poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    TrailerKey: '5xH0HfJHsaY',
    imdbRating: '8.5',
    rottenTomatoes: '99%',
    metacritic: '97/100',
    audienceScore: 85,
    tomatometerScore: 99,
    metascore: 97,
    note: 'Critics lead by +13 points: universal Palme d’Or and Oscar critical consensus (98 mean) vs. 85 audience score.',
  },
  {
    imdbID: 'tt15239678',
    Title: 'Dune: Part Two',
    Year: '2024',
    Director: 'Denis Villeneuve',
    Runtime: '166 min',
    Rated: 'PG-13',
    Type: 'movie',
    Genre: 'Action, Adventure, Sci-Fi',
    Format: 'IMAX 70mm · Anamorphic Panavision',
    Poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    TrailerKey: 'Way9Dexny3w',
    imdbRating: '8.5',
    rottenTomatoes: '92%',
    metacritic: '79/100',
    audienceScore: 85,
    tomatometerScore: 92,
    metascore: 79,
    note: 'Broad approval on Rotten Tomatoes (92) and IMDb (85), tempered by more reserved long-form Metacritic reviews (79).',
  },
  {
    imdbID: 'tt0078748',
    Title: 'Alien',
    Year: '1979',
    Director: 'Ridley Scott',
    Runtime: '117 min',
    Rated: 'R',
    Type: 'movie',
    Genre: 'Horror, Sci-Fi',
    Format: '35mm Anamorphic · Panavision',
    Poster: 'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
    TrailerKey: 'jQ5lPt9edzQ',
    imdbRating: '8.5',
    rottenTomatoes: '93%',
    metacritic: '89/100',
    audienceScore: 85,
    tomatometerScore: 93,
    metascore: 89,
    note: 'Archival reassessment elevated critical consensus (91 mean) above its initial 1979 genre reception.',
  },
];

/**
 * Computes the weighted index score (0-100), critic mean, and audience-critic spread.
 * @param {object} print - Archival print record with audienceScore, tomatometerScore, metascore
 * @param {number} criticWeight - 0 (pure audience) to 100 (pure critics)
 */
export function computeWeightedConsensus(print, criticWeight = 50) {
  if (!print) {
    return {
      weightedScore: 0,
      criticMean: 0,
      audienceScore: 0,
      spread: 0,
      verdict: 'Unindexed',
    };
  }

  const clampedWeight = Math.min(100, Math.max(0, Number(criticWeight) || 0));
  const audience = Number(print.audienceScore) || 0;
  const rt = Number(print.tomatometerScore) || 0;
  const mc = Number(print.metascore) || 0;
  const criticMean = Math.round((rt + mc) / 2);

  const criticRatio = clampedWeight / 100;
  const audienceRatio = 1 - criticRatio;
  const weightedScore = Math.round(audience * audienceRatio + criticMean * criticRatio);
  const spread = criticMean - audience;

  let verdict = 'Balanced Consensus';
  if (Math.abs(spread) <= 3) {
    verdict = 'Locked Consensus';
  } else if (spread > 3) {
    verdict = `Critics +${spread} pts`;
  } else {
    verdict = `Audience +${Math.abs(spread)} pts`;
  }

  return {
    weightedScore,
    criticMean,
    audienceScore: audience,
    spread,
    verdict,
  };
}
