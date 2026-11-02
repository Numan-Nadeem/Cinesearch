import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlass,
  ArrowRight,
  ArrowUpRight,
  BookmarkSimple,
  ArrowsClockwise,
  Compass,
  Play,
  X,
  Star,
  Scales,
  Medal,
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import bgIntro from '../assets/videos/intro_bg.mp4';
import movieBg from '../assets/images/movie_bg.jpg';
import contactBg from '../assets/images/contact_bg2.jpg';
import { getProviderAdapter, setActiveProviderId } from '../api/provider.js';
import { useActiveProvider } from '../hooks/useMovieSearch.js';
import { useDocumentMeta } from '../lib/seo.js';
import {
  ARCHIVAL_CONSENSUS_PRINTS,
  computeWeightedConsensus,
} from '../lib/consensus.js';
import { MEDIA_PROVENANCE } from '../design/mediaProvenance.js';
import MovieCard from '../components/ui/MovieCard.jsx';
import PosterArtwork from '../components/ui/PosterArtwork.jsx';
import WatchlistButton from '../components/features/WatchlistButton.jsx';
import HeroCinemaCanvas from '../components/features/HeroCinemaCanvas.jsx';
import { ResultGridSkeleton } from '../components/ui/Skeleton.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const REPERTORY_DOSSIERS = [
  {
    id: 'scifi',
    movement: 'Speculative cinema',
    directorFocus: 'Villeneuve · Scott · Nolan · Garland',
    featuredTitles: 'Dune: Part Two · Alien · Interstellar · The Matrix',
    synopsis:
      'High-concept speculative worlds, deep-space survival, and philosophical science fiction indexed with complete technical runtime and multi-critic scores.',
    query: 'Dune',
    yearHint: '2024',
    image: MEDIA_PROVENANCE.repertoryDossiers.scifi.url,
    fallbackImage: movieBg,
    credit: MEDIA_PROVENANCE.repertoryDossiers.scifi.source,
  },
  {
    id: 'noir',
    movement: 'Neo-noir thrillers',
    directorFocus: 'Nolan · Reeves · Fincher · Mann',
    featuredTitles: 'The Dark Knight · The Batman · Batman Begins',
    synopsis:
      'Shadow-drenched urban mysteries, psychological cat-and-mouse investigations, and morally complex crime dramas rendered in high-contrast chiaroscuro.',
    query: 'Batman',
    yearHint: '2008',
    image: MEDIA_PROVENANCE.repertoryDossiers.noir.url,
    fallbackImage: contactBg,
    credit: MEDIA_PROVENANCE.repertoryDossiers.noir.source,
  },
  {
    id: 'auteur',
    movement: 'Auteur landmarks',
    directorFocus: 'Bong Joon Ho · Nolan · Darabont',
    featuredTitles: 'Parasite · Oppenheimer · Inception · The Shawshank Redemption',
    synopsis:
      'Academy Award and Palme d’Or landmarks where audience passion meets near-unanimous critical consensus across IMDb, Rotten Tomatoes, and Metacritic.',
    query: 'Oppenheimer',
    yearHint: '2023',
    image: MEDIA_PROVENANCE.repertoryDossiers.auteur.url,
    fallbackImage: movieBg,
    credit: MEDIA_PROVENANCE.repertoryDossiers.auteur.source,
  },
  {
    id: 'series',
    movement: 'Prestige television',
    directorFocus: 'Gilligan · Benioff · The Duffer Brothers',
    featuredTitles: 'Breaking Bad · Game of Thrones · Stranger Things',
    synopsis:
      'Multi-season television landmarks catalogued with full season counts, episode-level lookups, principal cast credits, and instant local Watchlist persistence.',
    query: 'Breaking Bad',
    yearHint: '2008',
    image: MEDIA_PROVENANCE.repertoryDossiers.series.url,
    fallbackImage: contactBg,
    credit: MEDIA_PROVENANCE.repertoryDossiers.series.source,
  },
];

const MANIFESTO_STATEMENT =
  'Every film deserves more than one flattened score. We pair OMDb and TMDB records with IMDb, Rotten Tomatoes, and Metacritic consensus in one private index.';

const FEATURED_HERO_PRINT = ARCHIVAL_CONSENSUS_PRINTS[0];

const QUICK_HERO_QUERIES = [
  { label: 'Oppenheimer', query: 'Oppenheimer' },
  { label: 'Alien (1979)', query: 'Alien', year: '1979' },
  { label: 'Dune', query: 'Dune' },
  { label: 'Parasite', query: 'Parasite' },
];

const Home = () => {
  const navigate = useNavigate();
  const providerId = useActiveProvider();
  const videoRef = useRef(null);
  const homeRootRef = useRef(null);

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeDossierId, setActiveDossierId] = useState('scifi');
  const [heroQuickQuery, setHeroQuickQuery] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showHeroTrailer, setShowHeroTrailer] = useState(false);
  const [failedDossierImages, setFailedDossierImages] = useState({});

  // Live Consensus Comparator state ("One Live Thing")
  const [selectedPrintId, setSelectedPrintId] = useState(ARCHIVAL_CONSENSUS_PRINTS[0].imdbID);
  const [criticWeight, setCriticWeight] = useState(50);

  const activeConsensusPrint =
    ARCHIVAL_CONSENSUS_PRINTS.find((p) => p.imdbID === selectedPrintId) ||
    ARCHIVAL_CONSENSUS_PRINTS[0];
  const consensusResult = computeWeightedConsensus(activeConsensusPrint, criticWeight);

  useDocumentMeta({
    title: 'Home — Archival Film & Series Index',
    description:
      'Discover feature films and series across OMDb and TMDB, compare IMDb, Rotten Tomatoes & Metacritic ratings side by side, and curate your local Watchlist.',
  });

  useEffect(() => {
    if (!showHeroTrailer) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowHeroTrailer(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showHeroTrailer]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotionPreference = (matches) => {
      setPrefersReducedMotion(matches);
      if (videoRef.current) {
        if (matches) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
      }
    };
    applyMotionPreference(mq.matches);
    const listener = (e) => applyMotionPreference(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  const adapter = getProviderAdapter(providerId);
  const genres = ['All', ...adapter.genres()];

  const { data: trendingItems = [], isLoading: loadingTrending } = useQuery({
    queryKey: [providerId, 'trending', selectedGenre],
    queryFn: ({ signal }) =>
      adapter.trending(selectedGenre === 'All' ? '' : selectedGenre, { signal }),
  });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isMotionAllowed: '(prefers-reduced-motion: no-preference)',
          isReduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isMotionAllowed, isReduced } = context.conditions;

          if (isReduced) {
            gsap.set(
              '.gsap-hero-reveal, .gsap-section-item, .gsap-bento-card, .gsap-scale-item, .gsap-photo-drift',
              {
                opacity: 1,
                scale: 1,
                y: 0,
                clearProps: 'transform',
              }
            );
            return;
          }

          if (isMotionAllowed) {
            gsap.fromTo(
              '.gsap-hero-reveal',
              { y: 20, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.65,
                stagger: 0.07,
                ease: 'power3.out',
              }
            );

            const sectionGroups = gsap.utils.toArray('.gsap-stagger-section');
            sectionGroups.forEach((sec) => {
              const items = sec.querySelectorAll('.gsap-section-item');
              if (items.length > 0) {
                gsap.fromTo(
                  items,
                  { y: 24, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: 'power2.out',
                    scrollTrigger: {
                      trigger: sec,
                      start: 'top 86%',
                      toggleActions: 'play none none none',
                    },
                  }
                );
              }
            });

            gsap.fromTo(
              '.gsap-bento-card',
              { y: 24, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: '.gsap-bento-grid',
                  start: 'top 85%',
                  toggleActions: 'play none none none',
                },
              }
            );

            const scaleItems = gsap.utils.toArray('.gsap-scale-item');
            scaleItems.forEach((item) => {
              gsap.fromTo(
                item,
                { y: 20, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.55,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: item,
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                  },
                }
              );
            });

            const driftPhotos = gsap.utils.toArray('.gsap-photo-drift');
            driftPhotos.forEach((photo) => {
              gsap.fromTo(
                photo,
                { scale: 1.05 },
                {
                  scale: 1,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: photo,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                  },
                }
              );
            });
          }
        }
      );

      return () => mm.revert();
    },
    { scope: homeRootRef, dependencies: [trendingItems.length, selectedGenre] }
  );

  const handleHeroQuickSearch = (e) => {
    e.preventDefault();
    const trimmed = heroQuickQuery.trim();
    if (trimmed) {
      navigate(`/movies?query=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/movies');
    }
  };

  const activeDossier =
    REPERTORY_DOSSIERS.find((d) => d.id === activeDossierId) || REPERTORY_DOSSIERS[0];
  const activeDossierImg = failedDossierImages[activeDossier.id]
    ? activeDossier.fallbackImage
    : activeDossier.image;

  return (
    <div ref={homeRootRef} className="flex flex-col w-full max-w-full overflow-x-hidden">
      {/* SECTION 1: 12-COLUMN SPLIT PROJECTION STAGE HERO (Zero overlap on H1, moving reel on right) */}
      <section
        aria-label="CineSearch Repertory Index Hero"
        className="w-full bg-[#f5f2eb] dark:bg-[#0c0c0e] text-[#161514] dark:text-[#f2efe9] py-16 md:py-28 transition-colors duration-200"
      >
        <div className="max-w-[1360px] w-full mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left 7 Columns: Unobstructed Display Headline, Supporting Sentence, Quick Search & Primary Action */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <h1 className="gsap-hero-reveal font-display font-bold text-[#161514] dark:text-[#f2efe9] tracking-[-0.035em] leading-[0.96] text-[clamp(2.75rem,5.6vw,5.5rem)] mb-8">
                Cinema indexed in full.
              </h1>

              <p className="gsap-hero-reveal text-base sm:text-xl text-[#161514] dark:text-[#f2efe9] max-w-[54ch] leading-relaxed mb-9">
                Search feature films, limited series, and archival releases across OMDb and TMDB. Compare IMDb audience scores against Rotten Tomatoes and Metacritic consensus in one private ledger.
              </p>

              {/* Direct Hero Quick-Search Input */}
              <form
                onSubmit={handleHeroQuickSearch}
                role="search"
                aria-label="Quick catalogue search"
                data-ui="hero-search"
                className="gsap-hero-reveal w-full max-w-2xl mb-5"
              >
                <div className="flex flex-col sm:flex-row gap-2 p-2 bg-[#ebe6dc] dark:bg-[#151519]">
                  <div className="relative flex-1 flex items-center bg-[#f5f2eb] dark:bg-[#0c0c0e]">
                    <MagnifyingGlass
                      size={18}
                      weight="regular"
                      className="text-[#6b655e] ml-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={heroQuickQuery}
                      onChange={(e) => setHeroQuickQuery(e.target.value)}
                      placeholder="Search title, director, or release year (e.g., Oppenheimer)..."
                      aria-label="Search movies and series"
                      className="w-full bg-transparent px-3 py-3 text-sm text-[#161514] dark:text-[#f2efe9] placeholder:text-[#6b655e] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] text-white font-semibold text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
                  >
                    <span>Search Index</span>
                    <ArrowRight size={15} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </form>

              {/* Unboxed Typographic Reference Queries */}
              <div className="gsap-hero-reveal flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#494540] dark:text-[#b5b0a8] mb-10">
                <span className="font-semibold text-[#161514] dark:text-[#f2efe9]">
                  Reference queries:
                </span>
                {QUICK_HERO_QUERIES.map((preset, idx) => (
                  <span key={preset.label} className="inline-flex items-center">
                    {idx > 0 && (
                      <span aria-hidden="true" className="mr-3 text-[#6b655e]">
                        ·
                      </span>
                    )}
                    <Link
                      to={`/movies?query=${encodeURIComponent(preset.query)}${
                        preset.year ? `&year=${preset.year}` : ''
                      }`}
                      className="tabular-nums hover:text-[#c83a2b] dark:hover:text-[#d94636] underline underline-offset-4 transition-colors"
                    >
                      {preset.label}
                    </Link>
                  </span>
                ))}
              </div>
            </div>

            {/* Primary & Secondary Hero Actions */}
            <div className="gsap-hero-reveal flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#161514] dark:bg-[#f2efe9] hover:opacity-90 text-[#f2efe9] dark:text-[#161514] font-semibold text-xs active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
              >
                <span>Browse Full Catalogue</span>
                <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
              </Link>
              <Link
                to="/watchlist"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] text-[#161514] dark:text-[#f2efe9] font-semibold text-xs active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
              >
                <BookmarkSimple size={15} weight="duotone" aria-hidden="true" />
                <span>Personal Watchlist</span>
              </Link>
            </div>
          </div>

          {/* Right 5 Columns: Moving 35mm Reel Frame + Featured Reference Print Dossier */}
          <div className="gsap-hero-reveal lg:col-span-5 flex flex-col justify-between bg-[#ebe6dc] dark:bg-[#151519] p-5 sm:p-7">
            {/* Moving 35mm Archival Projection Reel Frame */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0c0c0e] mb-6">
              <video
                ref={videoRef}
                src={bgIntro}
                poster={movieBg}
                autoPlay={!prefersReducedMotion}
                loop
                muted
                playsInline
                aria-label="35mm archival projection reel loop"
                className="w-full h-full object-cover opacity-80 grayscale contrast-125"
              />
              <HeroCinemaCanvas />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 bg-[#0c0c0e]/90 px-3 py-2 text-xs text-[#f2efe9]">
                <span className="font-semibold">35mm Projection Booth Study</span>
                <button
                  type="button"
                  onClick={() => setShowHeroTrailer(true)}
                  className="inline-flex items-center gap-1.5 text-[#d94636] hover:text-white font-semibold cursor-pointer whitespace-nowrap"
                >
                  <Play size={12} weight="fill" aria-hidden="true" />
                  <span>Play IMAX Reel</span>
                </button>
              </div>
            </div>

            {/* Featured Reference Print Card */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <Link
                  to={`/movies/${FEATURED_HERO_PRINT.imdbID}`}
                  aria-label={`Inspect ${FEATURED_HERO_PRINT.Title} dossier`}
                  className="block aspect-[2/3] overflow-hidden bg-[#1b1b21]"
                >
                  <PosterArtwork
                    src={FEATURED_HERO_PRINT.Poster}
                    title={FEATURED_HERO_PRINT.Title}
                    year={FEATURED_HERO_PRINT.Year}
                    eager
                    className="w-full h-full"
                  />
                </Link>
              </div>
              <div className="col-span-8 flex flex-col justify-between">
                <p className="tabular-nums text-xs font-semibold text-[#c83a2b] dark:text-[#d94636] mb-1">
                  Reference Print · {FEATURED_HERO_PRINT.Year} · {FEATURED_HERO_PRINT.Runtime}
                </p>
                <p className="font-display text-xl sm:text-2xl font-bold text-[#161514] dark:text-white leading-tight mb-2">
                  <Link
                    to={`/movies/${FEATURED_HERO_PRINT.imdbID}`}
                    className="hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
                  >
                    {FEATURED_HERO_PRINT.Title}
                  </Link>
                </p>
                <p className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8] mb-4">
                  IMDb {FEATURED_HERO_PRINT.imdbRating}/10 · Tomatometer {FEATURED_HERO_PRINT.rottenTomatoes} · Metascore {FEATURED_HERO_PRINT.metacritic}
                </p>
                <div className="flex items-center gap-3">
                  <WatchlistButton movie={FEATURED_HERO_PRINT} variant="card" />
                  <Link
                    to={`/movies/${FEATURED_HERO_PRINT.imdbID}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#161514] dark:text-white hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
                  >
                    <span>Open Dossier</span>
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE LIVE THING — INTERACTIVE REPERTORY CONSENSUS COMPARATOR (data-ui) */}
      <section
        aria-labelledby="consensus-desk-heading"
        className="gsap-stagger-section w-full bg-[#ebe6dc] dark:bg-[#151519] py-24 md:py-36 transition-colors"
      >
        <div className="max-w-[1360px] w-full mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
            <div className="gsap-section-item lg:col-span-6">
              <h2
                id="consensus-desk-heading"
                className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#161514] dark:text-white leading-[1.02]"
              >
                Three critics, one ledger.
              </h2>
            </div>
            <div className="gsap-section-item lg:col-span-6">
              <p className="text-base sm:text-lg text-[#161514] dark:text-[#f2efe9] leading-relaxed">
                Select an archival print below and slide the weighting balance between mass audience polling (IMDb) and critical consensus (Rotten Tomatoes &amp; Metacritic) to inspect how reception diverges.
              </p>
            </div>
          </div>

          {/* Interactive Consensus Comparator Desk */}
          <div
            data-ui="consensus-comparator"
            data-testid="consensus-comparator"
            className="gsap-section-item bg-[#f5f2eb] dark:bg-[#0c0c0e] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start"
          >
            {/* Left 5 Cols: Print Selector & Weighting Slider Control */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div>
                <span className="block text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] mb-3">
                  Select archival print to inspect
                </span>
                <div
                  role="group"
                  aria-label="Archival prints"
                  className="flex flex-wrap gap-2"
                >
                  {ARCHIVAL_CONSENSUS_PRINTS.map((print) => {
                    const isSelected = print.imdbID === activeConsensusPrint.imdbID;
                    return (
                      <button
                        key={print.imdbID}
                        type="button"
                        onClick={() => setSelectedPrintId(print.imdbID)}
                        aria-pressed={isSelected}
                        className={`px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#c83a2b] text-white'
                            : 'bg-[#ebe6dc] dark:bg-[#151519] text-[#161514] dark:text-[#f2efe9] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23]'
                        }`}
                      >
                        {print.Title} ({print.Year})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience vs. Critics Weighting Slider */}
              <div className="bg-[#ebe6dc] dark:bg-[#151519] p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label
                    htmlFor="critic-weight-slider"
                    className="text-xs font-semibold text-[#161514] dark:text-white"
                  >
                    Consensus Weighting Balance
                  </label>
                  <span
                    data-testid="consensus-weight-label"
                    className="tabular-nums text-xs font-bold text-[#c83a2b] dark:text-[#d94636]"
                  >
                    {100 - criticWeight}% Audience · {criticWeight}% Critics
                  </span>
                </div>

                <input
                  id="critic-weight-slider"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={criticWeight}
                  onChange={(e) => setCriticWeight(Number(e.target.value))}
                  aria-describedby="critic-weight-help"
                  className="w-full accent-[#c83a2b] cursor-pointer my-2"
                />

                <div
                  id="critic-weight-help"
                  className="flex items-center justify-between gap-2 pt-2"
                >
                  <button
                    type="button"
                    onClick={() => setCriticWeight(0)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#f5f2eb] dark:bg-[#0c0c0e] text-[#161514] dark:text-[#f2efe9] hover:bg-[#c83a2b] hover:text-white cursor-pointer transition-colors"
                  >
                    100% Audience
                  </button>
                  <button
                    type="button"
                    onClick={() => setCriticWeight(50)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#f5f2eb] dark:bg-[#0c0c0e] text-[#161514] dark:text-[#f2efe9] hover:bg-[#c83a2b] hover:text-white cursor-pointer transition-colors"
                  >
                    50 / 50 Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => setCriticWeight(100)}
                    className="px-2.5 py-1 text-xs font-semibold bg-[#f5f2eb] dark:bg-[#0c0c0e] text-[#161514] dark:text-[#f2efe9] hover:bg-[#c83a2b] hover:text-white cursor-pointer transition-colors"
                  >
                    100% Critics
                  </button>
                </div>
              </div>

              {/* Active Adapter Switch */}
              <div className="bg-[#ebe6dc] dark:bg-[#151519] p-5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-xs text-[#494540] dark:text-[#b5b0a8]">
                    Active Catalogue Source
                  </span>
                  <strong className="text-sm font-bold text-[#161514] dark:text-white uppercase">
                    {providerId} Index Adapter
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveProviderId(providerId === 'omdb' ? 'tmdb' : 'omdb')
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#161514] dark:bg-[#f2efe9] text-[#f2efe9] dark:text-[#161514] text-xs font-semibold hover:opacity-90 cursor-pointer transition-all whitespace-nowrap shrink-0"
                >
                  <span>
                    Switch to {providerId === 'omdb' ? 'TMDB' : 'OMDb'} Adapter
                  </span>
                  <ArrowsClockwise size={14} weight="bold" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Right 7 Cols: Live Tri-Source Ledger Readout & Poster Plate */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#ebe6dc] dark:bg-[#151519] p-6 sm:p-8">
              <div className="sm:col-span-4 aspect-[2/3] overflow-hidden bg-[#1b1b21]">
                <Link
                  to={`/movies/${activeConsensusPrint.imdbID}`}
                  aria-label={`Inspect ${activeConsensusPrint.Title} dossier`}
                  className="block w-full h-full"
                >
                  <PosterArtwork
                    src={activeConsensusPrint.Poster}
                    title={activeConsensusPrint.Title}
                    year={activeConsensusPrint.Year}
                    className="w-full h-full"
                  />
                </Link>
              </div>

              <div className="sm:col-span-8 flex flex-col justify-between gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl sm:text-3xl font-bold text-[#161514] dark:text-white">
                      {activeConsensusPrint.Title}
                    </p>
                    <p className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                      {activeConsensusPrint.Year} · {activeConsensusPrint.Director} · {activeConsensusPrint.Format}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      data-testid="weighted-consensus-score"
                      className="tabular-nums font-display text-3xl sm:text-4xl font-bold text-[#c83a2b] dark:text-[#d94636]"
                    >
                      {consensusResult.weightedScore}
                    </span>
                    <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8] block">
                      {consensusResult.verdict}
                    </span>
                  </div>
                </div>

                {/* Normalized 3-Source Bars */}
                <div className="space-y-3 py-2">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[#161514] dark:text-[#f2efe9]">
                        <Star size={14} weight="fill" className="text-[#b87d24] dark:text-[#deb052]" aria-hidden="true" />
                        <span>IMDb Audience ({activeConsensusPrint.imdbRating}/10)</span>
                      </span>
                      <span className="tabular-nums text-[#161514] dark:text-white">
                        {activeConsensusPrint.audienceScore} / 100
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#e2dcd0] dark:bg-[#24242c]">
                      <div
                        className="h-full bg-[#b87d24] dark:bg-[#deb052] transition-all duration-200"
                        style={{ width: `${activeConsensusPrint.audienceScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[#161514] dark:text-[#f2efe9]">
                        <Scales size={14} weight="duotone" className="text-[#c83a2b] dark:text-[#d94636]" aria-hidden="true" />
                        <span>Rotten Tomatoes Tomatometer</span>
                      </span>
                      <span className="tabular-nums text-[#161514] dark:text-white">
                        {activeConsensusPrint.rottenTomatoes}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#e2dcd0] dark:bg-[#24242c]">
                      <div
                        className="h-full bg-[#c83a2b] dark:bg-[#d94636] transition-all duration-200"
                        style={{ width: `${activeConsensusPrint.tomatometerScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="inline-flex items-center gap-1.5 text-[#161514] dark:text-[#f2efe9]">
                        <Medal size={14} weight="duotone" className="text-[#494540] dark:text-[#b5b0a8]" aria-hidden="true" />
                        <span>Metacritic Metascore</span>
                      </span>
                      <span className="tabular-nums text-[#161514] dark:text-white">
                        {activeConsensusPrint.metacritic}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#e2dcd0] dark:bg-[#24242c]">
                      <div
                        className="h-full bg-[#161514] dark:bg-[#f2efe9] transition-all duration-200"
                        style={{ width: `${activeConsensusPrint.metascore}%` }}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
                  {activeConsensusPrint.note}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <WatchlistButton movie={activeConsensusPrint} variant="full" />
                  <Link
                    to={`/movies/${activeConsensusPrint.imdbID}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#161514] dark:text-white hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
                  >
                    <span>Inspect Full Dossier</span>
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: ASYMMETRIC ARCHITECTURAL SHOWCASE (7+5 / 5+7) */}
      <section
        aria-labelledby="bento-architecture-heading"
        className="gsap-stagger-section max-w-[1360px] w-full mx-auto px-5 sm:px-8 py-24 md:py-36"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
          <div className="gsap-section-item lg:col-span-6">
            <h2
              id="bento-architecture-heading"
              className="font-display text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-[#161514] dark:text-white leading-[1.02]"
            >
              Two catalogues, zero tracking.
            </h2>
          </div>
          <div className="gsap-section-item lg:col-span-6">
            <p className="text-base sm:text-lg text-[#161514] dark:text-[#f2efe9] leading-relaxed">
              Streaming platforms bury film history behind algorithmic carousels. CineSearch treats every release as an archival print—surfacing verified credits, release-year facets, and offline-ready local curation.
            </p>
          </div>
        </div>

        {/* Asymmetric 12-Column Architectural Grid: Row 1 (7 + 5 = 12), Row 2 (5 + 7 = 12) */}
        <div
          data-testid="gapless-bento-grid"
          className="gsap-bento-grid grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
        >
          {/* Showcase Panel 1 (md:col-span-7): Archival Auditorium Plate & Dual-Catalogue Specs */}
          <article className="gsap-bento-card md:col-span-7 bg-[#ebe6dc] dark:bg-[#151519] p-7 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-display text-xl lg:text-2xl font-bold text-[#161514] dark:text-white tracking-tight leading-tight mb-3">
                Dual-catalogue engine
              </h3>
              <p className="text-base text-[#161514] dark:text-[#f2efe9] leading-relaxed max-w-[58ch] mb-6">
                Query OMDb and TMDB through serverless proxy adapters without exposing keys. A deterministic 21-title archival repertory guarantees zero-downtime search and filtering even when offline.
              </p>

              <figure className="w-full overflow-hidden bg-[#1b1b21] mb-6">
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={MEDIA_PROVENANCE.editorialStills[0].url}
                    alt="35mm projection light beam cutting across a dark repertory cinema auditorium"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="gsap-photo-drift w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <figcaption className="px-4 py-2.5 text-xs text-[#b5b0a8] bg-[#151519] flex justify-between">
                  <span>35mm Repertory Auditorium Study</span>
                  <span>{MEDIA_PROVENANCE.editorialStills[0].license}</span>
                </figcaption>
              </figure>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to="/movies"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c83a2b] dark:text-[#d94636] hover:underline whitespace-nowrap"
              >
                <span>Open Search Workbench</span>
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
              <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                1880–Present Release Facets
              </span>
            </div>
          </article>

          {/* Showcase Panel 2 (md:col-span-5): Private Local-First Watchlist Vault */}
          <article className="gsap-bento-card md:col-span-5 bg-[#e2dcd0] dark:bg-[#1d1d23] p-7 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="font-display text-xl lg:text-2xl font-bold text-[#161514] dark:text-white tracking-tight leading-tight mb-3">
                Private Watchlist
              </h3>
              <p className="text-base text-[#161514] dark:text-[#f2efe9] leading-relaxed mb-6">
                Curate your personal screening queue in browser storage with zero account walls, instant undo on removal, multi-key sorting, and one-click JSON export and import.
              </p>

              <figure className="w-full overflow-hidden bg-[#1b1b21] mb-6">
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={MEDIA_PROVENANCE.editorialStills[1].url}
                    alt="Optical bench and 35mm celluloid film inspection plate"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="gsap-photo-drift w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <figcaption className="px-4 py-2.5 text-xs text-[#b5b0a8] bg-[#151519] flex justify-between">
                  <span>Optical Celluloid Inspection Plate</span>
                  <span>{MEDIA_PROVENANCE.editorialStills[1].license}</span>
                </figcaption>
              </figure>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/watchlist"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#c83a2b] hover:bg-[#a92e21] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Personal Watchlist</span>
                <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
              </Link>
              <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                Portable JSON Backup
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* SECTION 4: FOUR REPERTORY MOVEMENTS — INTERACTIVE STAGE (No text over images) */}
      <section
        aria-labelledby="repertory-dossiers-heading"
        className="gsap-stagger-section w-full bg-[#ebe6dc] dark:bg-[#151519] py-24 md:py-36 transition-colors"
      >
        <div className="max-w-[1360px] w-full mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-14">
            <div className="gsap-section-item lg:col-span-6">
              <h2
                id="repertory-dossiers-heading"
                className="font-display text-3xl sm:text-5xl font-bold text-[#161514] dark:text-white tracking-[-0.03em] leading-[1.02]"
              >
                Four repertory movements.
              </h2>
            </div>
            <div className="gsap-section-item lg:col-span-6">
              <p className="text-base sm:text-lg text-[#161514] dark:text-[#f2efe9] leading-relaxed">
                Select any movement below to inspect its director focus, archival film still, and direct catalogue filter.
              </p>
            </div>
          </div>

          <div className="gsap-section-item grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 5 Cols: Movement Selector Tabs */}
            <div
              role="tablist"
              aria-label="Repertory cinema movements"
              className="lg:col-span-5 flex flex-col justify-between gap-3"
            >
              {REPERTORY_DOSSIERS.map((dossier) => {
                const isSelected = dossier.id === activeDossierId;
                return (
                  <button
                    key={dossier.id}
                    type="button"
                    role="tab"
                    id={`dossier-tab-${dossier.id}`}
                    aria-selected={isSelected}
                    onClick={() => setActiveDossierId(dossier.id)}
                    className={`w-full text-left p-5 sm:p-6 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] ${
                      isSelected
                        ? 'bg-[#161514] dark:bg-[#f2efe9] text-[#f2efe9] dark:text-[#161514]'
                        : 'bg-[#f5f2eb] dark:bg-[#0c0c0e] text-[#161514] dark:text-[#f2efe9] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                        {dossier.movement}
                      </h3>
                      <span
                        className={`tabular-nums text-xs font-semibold ${
                          isSelected
                            ? 'text-[#d94636] dark:text-[#c83a2b]'
                            : 'text-[#6b655e] dark:text-[#8a847c]'
                        }`}
                      >
                        {dossier.yearHint}
                      </span>
                    </div>
                    <p
                      className={`text-xs font-medium truncate ${
                        isSelected
                          ? 'text-[#e2dcd0] dark:text-[#494540]'
                          : 'text-[#494540] dark:text-[#b5b0a8]'
                      }`}
                    >
                      {dossier.directorFocus}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right 7 Cols: Active Movement Archival Still & Unobstructed Dossier Panel */}
            <div
              role="tabpanel"
              aria-labelledby={`dossier-tab-${activeDossier.id}`}
              className="lg:col-span-7 bg-[#f5f2eb] dark:bg-[#0c0c0e] p-6 sm:p-8 flex flex-col justify-between"
            >
              <figure className="w-full overflow-hidden bg-[#1b1b21] mb-6">
                <div className="aspect-[16/9] w-full overflow-hidden">
                  <img
                    src={activeDossierImg}
                    alt={activeDossier.movement}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedDossierImages((prev) => ({
                        ...prev,
                        [activeDossier.id]: true,
                      }))
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="px-4 py-2.5 text-xs text-[#b5b0a8] bg-[#151519] flex flex-wrap justify-between gap-2">
                  <span>{activeDossier.featuredTitles}</span>
                  <span>{activeDossier.credit}</span>
                </figcaption>
              </figure>

              <div>
                <p className="text-base sm:text-lg text-[#161514] dark:text-[#f2efe9] leading-relaxed mb-6">
                  {activeDossier.synopsis}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={`/movies?query=${encodeURIComponent(activeDossier.query)}`}
                    className="inline-flex items-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-6 py-3 text-xs font-semibold text-white transition-all whitespace-nowrap shrink-0"
                  >
                    <span>Explore {activeDossier.query} Repertory</span>
                    <ArrowRight size={15} weight="bold" aria-hidden="true" />
                  </Link>
                  <Link
                    to={`/movies?query=${encodeURIComponent(activeDossier.query)}&year=${activeDossier.yearHint}`}
                    className="inline-flex items-center gap-1.5 tabular-nums text-xs font-semibold text-[#161514] dark:text-[#f2efe9] hover:text-[#c83a2b] dark:hover:text-[#d94636] underline underline-offset-4 whitespace-nowrap shrink-0"
                  >
                    <span>Filter by Release Year ({activeDossier.yearHint})</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CURATORIAL STATEMENT & METHODOLOGY (Statement <= 32px desktop, <= 22px mobile, 24 words) */}
      <section
        aria-labelledby="philosophy-heading"
        className="gsap-stagger-section w-full bg-[#e2dcd0] dark:bg-[#1d1d23] text-[#161514] dark:text-[#f2efe9] py-24 md:py-36 transition-colors"
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="gsap-section-item lg:col-span-5">
            <h2
              id="philosophy-heading"
              className="font-display text-3xl sm:text-5xl font-bold text-[#161514] dark:text-white tracking-[-0.03em] leading-[1.02] mb-4"
            >
              Why three scores matter.
            </h2>
            <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
              Audience ratings reward immediacy; critical metascores weight craft and historical context. Reading all three side by side reveals the true shape of a film’s reception.
            </p>
          </div>

          <div className="gsap-section-item lg:col-span-7 bg-[#f5f2eb] dark:bg-[#0c0c0e] p-7 sm:p-10">
            <blockquote className="font-display font-medium text-lg sm:text-2xl lg:text-[28px] leading-[1.35] tracking-tight text-[#161514] dark:text-[#f2efe9] mb-8">
              &ldquo;{MANIFESTO_STATEMENT}&rdquo;
            </blockquote>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
                <strong className="block text-sm font-bold text-[#161514] dark:text-white mb-1">
                  IMDb Polling
                </strong>
                <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                  10-point audience scale
                </span>
              </div>
              <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
                <strong className="block text-sm font-bold text-[#161514] dark:text-white mb-1">
                  Tomatometer
                </strong>
                <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                  Positive review ratio (%)
                </span>
              </div>
              <div className="bg-[#ebe6dc] dark:bg-[#151519] p-4">
                <strong className="block text-sm font-bold text-[#161514] dark:text-white mb-1">
                  Metascore
                </strong>
                <span className="tabular-nums text-xs text-[#494540] dark:text-[#b5b0a8]">
                  Weighted critic average (0–100)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CATALOGUE SPOTLIGHT & ACCLAIMED RELEASES */}
      <section
        aria-labelledby="trending-heading"
        className="gsap-stagger-section max-w-[1360px] w-full mx-auto px-5 sm:px-8 py-24 md:py-36"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Sticky Control Column */}
          <div className="gsap-section-item lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-6">
            <div>
              <h2
                id="trending-heading"
                className="font-display text-3xl sm:text-5xl font-bold text-[#161514] dark:text-white tracking-[-0.03em] leading-[1.02] mb-4"
              >
                Acclaimed in the index.
              </h2>
              <p className="text-base text-[#161514] dark:text-[#f2efe9] leading-relaxed">
                Filter the live {providerId.toUpperCase()} repertory by genre while browsing the featured selection, or launch into the full search index.
              </p>
            </div>

            {/* Interactive Genre Filter Controls */}
            <div
              role="group"
              aria-label="Filter trending titles by genre"
              className="flex flex-wrap gap-2"
            >
              {genres.map((genre) => {
                const active = selectedGenre === genre;
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => setSelectedGenre(genre)}
                    aria-pressed={active}
                    className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] ${
                      active
                        ? 'bg-[#c83a2b] text-white'
                        : 'bg-[#ebe6dc] dark:bg-[#151519] text-[#161514] dark:text-[#f2efe9] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23]'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <Link
                to={
                  selectedGenre === 'All'
                    ? '/movies?query=batman'
                    : `/movies?query=${encodeURIComponent(selectedGenre)}`
                }
                className="inline-flex items-center justify-center gap-2 bg-[#161514] dark:bg-[#f2efe9] text-[#f2efe9] dark:text-[#161514] px-6 py-3.5 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Compass size={18} weight="duotone" aria-hidden="true" />
                <span>Open Full Search Index</span>
              </Link>
            </div>
          </div>

          {/* Right 8 Columns: Lead Curatorial Selection + Editorial Repertory Showcase */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {loadingTrending ? (
              <ResultGridSkeleton count={4} />
            ) : trendingItems.length > 0 ? (
              <>
                {(() => {
                  const leadMovie = trendingItems[0];
                  const restMovies = trendingItems.slice(1, 5);
                  const hasLeadRating = Boolean(
                    leadMovie.imdbRating && leadMovie.imdbRating !== 'N/A'
                  );
                  return (
                    <>
                      <article className="gsap-scale-item spotlight-card group overflow-hidden bg-[#ebe6dc] dark:bg-[#151519] p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        <div className="sm:col-span-4 aspect-[2/3] overflow-hidden bg-[#1b1b21]">
                          <Link
                            to={`/movies/${leadMovie.imdbID}`}
                            aria-label={`Inspect lead release ${leadMovie.Title}`}
                            className="block w-full h-full overflow-hidden"
                          >
                            <PosterArtwork
                              src={leadMovie.Poster}
                              title={leadMovie.Title}
                              year={leadMovie.Year}
                              className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                            />
                          </Link>
                        </div>

                        <div className="sm:col-span-8 flex flex-col justify-between h-full py-1">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs tabular-nums text-[#494540] dark:text-[#b5b0a8]">
                              <span className="text-[#c83a2b] dark:text-[#d94636] font-semibold">
                                Lead Curatorial Selection
                              </span>
                              {hasLeadRating && (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#b87d24] dark:text-[#deb052]">
                                  <Star size={13} weight="fill" aria-hidden="true" />
                                  <span>{leadMovie.imdbRating}/10 IMDb</span>
                                </span>
                              )}
                            </div>

                            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#161514] dark:text-white mb-2">
                              <Link
                                to={`/movies/${leadMovie.imdbID}`}
                                className="variable-display-link hover:text-[#c83a2b] dark:hover:text-[#d94636]"
                              >
                                {leadMovie.Title}
                              </Link>
                            </p>

                            <div className="text-xs tabular-nums text-[#494540] dark:text-[#b5b0a8] mb-4">
                              <span className="capitalize font-semibold text-[#161514] dark:text-[#f2efe9]">
                                {leadMovie.Type || 'Movie'}
                              </span>
                              {leadMovie.Year ? ` · ${leadMovie.Year}` : ''}
                              {leadMovie.Genre ? ` · ${leadMovie.Genre}` : ''}
                            </div>

                            <p className="text-base text-[#161514] dark:text-[#f2efe9] leading-relaxed max-w-[56ch] mb-6">
                              {leadMovie.Plot && leadMovie.Plot !== 'N/A'
                                ? leadMovie.Plot
                                : `Indexed in the ${providerId.toUpperCase()} repertory with complete cast credits, release specifications, and multi-source critical consensus.`}
                            </p>
                          </div>

                          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                            <WatchlistButton movie={leadMovie} variant="card" />
                            <Link
                              to={`/movies/${leadMovie.imdbID}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#161514] dark:text-white hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
                            >
                              <span>Inspect full accession dossier</span>
                              <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </article>

                      {restMovies.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {restMovies.map((movie) => (
                            <div key={movie.imdbID} className="gsap-scale-item h-full">
                              <MovieCard
                                curMovie={movie}
                                navigateToMovie={() => navigate(`/movies/${movie.imdbID}`)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* SECTION 7: HIGH-CONTRAST CONVERSION CLOSE */}
      <section
        aria-labelledby="conversion-coda-heading"
        className="gsap-stagger-section w-full bg-[#ebe6dc] dark:bg-[#151519] py-24 md:py-32 transition-colors"
      >
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="gsap-section-item lg:col-span-7">
            <h2
              id="conversion-coda-heading"
              className="font-display text-3xl sm:text-5xl font-bold text-[#161514] dark:text-white tracking-[-0.03em] leading-[1.02] mb-4"
            >
              Open your screening room.
            </h2>
            <p className="text-base sm:text-lg text-[#161514] dark:text-[#f2efe9] leading-relaxed max-w-[56ch]">
              Query any film, series, or episode by release year, inspect full cast and box-office dossiers, and export your Watchlist as portable JSON at any time.
            </p>
          </div>

          <div className="gsap-section-item lg:col-span-5 flex flex-wrap lg:justify-end items-center gap-4">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] text-white font-semibold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
            >
              <span>Search the Catalogue</span>
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </Link>
            <Link
              to="/movies/tt15398776"
              className="inline-flex items-center gap-2 px-6 py-4 bg-[#f5f2eb] dark:bg-[#0c0c0e] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] text-[#161514] dark:text-white font-semibold text-xs active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c83a2b] whitespace-nowrap shrink-0"
            >
              <span>Inspect Oppenheimer (2023)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Hero Print Trailer Modal */}
      {showHeroTrailer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${FEATURED_HERO_PRINT.Title} Official Trailer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowHeroTrailer(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden bg-[#0c0c0e] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#151519] text-white">
              <h3 className="font-display font-bold text-base">
                {FEATURED_HERO_PRINT.Title} ({FEATURED_HERO_PRINT.Year})
              </h3>
              <button
                type="button"
                onClick={() => setShowHeroTrailer(false)}
                aria-label="Close trailer modal"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#b5b0a8] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X size={16} aria-hidden="true" />
                <span>Close</span>
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                title={`${FEATURED_HERO_PRINT.Title} Trailer`}
                src={`https://www.youtube-nocookie.com/embed/${FEATURED_HERO_PRINT.TrailerKey}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;