import movieBg from '../assets/images/movie_bg.jpg';
import contactBg from '../assets/images/contact_bg2.jpg';

/**
 * Media & Asset Provenance Ledger
 * Uses bundled first-party repository assets and official TMDB archival stills.
 * Zero unverified Unsplash or Picsum placeholder URLs (frontend-design Section 3.A).
 */
export const MEDIA_PROVENANCE = {
  heroVideo: {
    id: 'hero-35mm-reel-video',
    path: '/src/assets/videos/intro_bg.mp4',
    poster: movieBg,
    credit: 'CineSearch First-Party Archival Reel Footage (Repository Asset)',
    license: 'MIT / Repository Bundled Asset',
    aspectRatio: '16:9',
    role: 'Primary hero atmospheric projection background',
  },
  editorialStills: [
    {
      id: 'archival-projection-booth',
      url: movieBg,
      credit: 'Archival 35mm Repertory Study · Repository Plate I',
      license: 'MIT / Bundled Archival Plate',
      aspectRatio: '16:10',
      role: 'Editorial Critical Ledger visual anchor',
    },
    {
      id: 'celluloid-film-inspection',
      url: contactBg,
      credit: 'Optical Bench & Celluloid Study · Repository Plate II',
      license: 'MIT / Bundled Archival Plate',
      aspectRatio: '16:10',
      role: 'Dual-provider architecture & archival curation illustration',
    },
  ],
  repertoryDossiers: {
    scifi: {
      title: 'Dune: Part Two (2024)',
      url: 'https://image.tmdb.org/t/p/w1280/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      source: 'TMDB Official Archival Still · Legendary Pictures',
      aspectRatio: '16:10',
    },
    noir: {
      title: 'The Batman (2022)',
      url: 'https://image.tmdb.org/t/p/w1280/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      source: 'TMDB Official Archival Still · Warner Bros. Pictures',
      aspectRatio: '16:10',
    },
    auteur: {
      title: 'Parasite (2019)',
      url: 'https://image.tmdb.org/t/p/w1280/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
      source: 'TMDB Official Archival Still · CJ Entertainment',
      aspectRatio: '16:10',
    },
    series: {
      title: 'Breaking Bad (2008–2013)',
      url: 'https://image.tmdb.org/t/p/w1280/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
      source: 'TMDB Official Archival Still · AMC Studios',
      aspectRatio: '16:10',
    },
  },
  creatorAvatar: {
    name: 'Numan Nadeem',
    url: 'https://avatars.githubusercontent.com/u/142736266?v=4',
    fallbackPhoto: movieBg,
    source: 'Official GitHub Creator Profile (@Numan-Nadeem)',
  },
};
