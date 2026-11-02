import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';
import {
  FilmSlate,
  FilmStrip,
  ProjectorScreenChart,
  TelevisionSimple,
  Broadcast,
  Aperture,
  Waveform,
  Certificate,
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import bgIntro from '../assets/videos/intro_bg.mp4';
import movieBg from '../assets/images/movie_bg.jpg';
import { getProviderAdapter } from '../api/provider.js';
import { useActiveProvider } from '../hooks/useMovieSearch.js';
import { useDocumentMeta } from '../lib/seo.js';
import MovieCard from '../components/ui/MovieCard.jsx';
import { ResultGridSkeleton } from '../components/ui/Skeleton.jsx';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const MARQUEE_ITEMS = [
  { label: 'IMAX 70MM ARCHIVE', Icon: FilmSlate },
  { label: 'OMDB & TMDB DUAL ENGINE', Icon: ProjectorScreenChart },
  { label: 'ROTTEN TOMATOES CONSENSUS', Icon: Certificate },
  { label: 'METACRITIC METASCORE', Icon: Waveform },
  { label: '35MM REPERTORY INDEX', Icon: FilmStrip },
  { label: 'PRESTIGE SERIES CATALOGUE', Icon: TelevisionSimple },
  { label: 'DIRECTOR FILMOGRAPHIES', Icon: Aperture },
  { label: 'LOCAL-FIRST WATCHLIST', Icon: Broadcast },
];

const ACCORDION_PANELS = [
  {
    id: 'scifi',
    title: 'Speculative & Cyberpunk',
    subtitle: 'Dune, Blade Runner, Alien, Interstellar',
    description:
      'Explore visionary world-building, off-world colonies, and high-concept speculative cinema across seven decades.',
    query: 'Blade Runner',
    image: 'https://picsum.photos/seed/cyberpunk-cinema/1920/1080',
  },
  {
    id: 'noir',
    title: 'Neo-Noir & Crime Thrillers',
    subtitle: 'The Dark Knight, Se7en, Heat, Zodiac',
    description:
      'Shadow-drenched urban mysteries, psychological cat-and-mouse thrillers, and meticulous procedural dramas.',
    query: 'Batman',
    image: 'https://picsum.photos/seed/noir-thriller/1920/1080',
  },
  {
    id: 'auteur',
    title: 'Contemporary Auteur Cinema',
    subtitle: 'Oppenheimer, Parasite, Inception, Arrival',
    description:
      'Award-winning feature films with side-by-side IMDb, Rotten Tomatoes, and Metacritic critical scores.',
    query: 'Oppenheimer',
    image: 'https://picsum.photos/seed/auteur-film/1920/1080',
  },
  {
    id: 'series',
    title: 'Prestige Television & Limited Series',
    subtitle: 'Breaking Bad, Arcane, Chernobyl, Severance',
    description:
      'Multi-season television landmarks indexed with full season counts, cast credits, and instant watchlist persistence.',
    query: 'Breaking Bad',
    image: 'https://picsum.photos/seed/prestige-series/1920/1080',
  },
];

const SCRUB_STATEMENT =
  'Every great film deserves more than a single algorithmically flattened score. CineSearch pairs archival metadata from OMDb and TMDB with three-source critical consensus and a private, offline-ready Watchlist.';

const Home = () => {
  const navigate = useNavigate();
  const providerId = useActiveProvider();
  const videoRef = useRef(null);
  const homeRootRef = useRef(null);
  const scrubSectionRef = useRef(null);
  const splitSectionRef = useRef(null);
  const splitPinLeftRef = useRef(null);

  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeAccordion, setActiveAccordion] = useState('scifi');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useDocumentMeta({
    title: 'Home — Discover Movies & TV Series',
    description:
      'Discover, explore, and enjoy a world of movies and TV shows on CineSearch. Browse trending titles, compare ratings, and build your personal watchlist.',
  });

  // Respect prefers-reduced-motion for the autoplaying hero video (CS-17, F6)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
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

  // GSAP ScrollTrigger Paradigms: Scrubbing Text Reveal, Image Scale & Fade, and Split Scroll Pinning
  // Strictly gated behind gsap.matchMedia() to honor prefers-reduced-motion: reduce
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
          isMotionAllowed: '(prefers-reduced-motion: no-preference)',
          isReduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, isMotionAllowed, isReduced } = context.conditions;

          if (isReduced) {
            gsap.set('.gsap-scrub-word', { opacity: 1 });
            gsap.set('.gsap-scale-media', { scale: 1, opacity: 1 });
            return;
          }

          if (isMotionAllowed) {
            const words = gsap.utils.toArray('.gsap-scrub-word');
            if (words.length > 0 && scrubSectionRef.current) {
              gsap.fromTo(
                words,
                { opacity: 0.16 },
                {
                  opacity: 1,
                  stagger: 0.05,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: scrubSectionRef.current,
                    start: 'top 80%',
                    end: 'bottom 45%',
                    scrub: true,
                  },
                }
              );
            }

            const mediaCards = gsap.utils.toArray('.gsap-scale-media');
            mediaCards.forEach((el) => {
              gsap.fromTo(
                el,
                { scale: 0.88, opacity: 0.55 },
                {
                  scale: 1,
                  opacity: 1,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    end: 'top 35%',
                    scrub: true,
                  },
                }
              );
            });
          }

          if (isDesktop && splitSectionRef.current && splitPinLeftRef.current) {
            ScrollTrigger.create({
              trigger: splitSectionRef.current,
              start: 'top 110px',
              end: 'bottom bottom',
              pin: splitPinLeftRef.current,
              pinSpacing: false,
            });
          }
        }
      );

      return () => mm.revert();
    },
    { scope: homeRootRef, dependencies: [trendingItems.length, selectedGenre] }
  );

  const scrubWords = SCRUB_STATEMENT.split(' ');

  return (
    <div ref={homeRootRef} className="flex flex-col w-full max-w-full overflow-x-hidden">
      {/* AIDA STAGE 1: ATTENTION — Cinematic Center Hero with 2-Line H1 & Inline Typography Images */}
      <section
        aria-label="Welcome to CineSearch"
        className="relative min-h-[86dvh] flex items-center justify-center w-full px-6 md:px-12 py-24 overflow-hidden bg-[#09090b]"
      >
        <video
          ref={videoRef}
          src={bgIntro}
          poster={movieBg}
          autoPlay={!prefersReducedMotion}
          loop
          muted
          playsInline
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-45 grayscale contrast-125"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,9,11,0.45)_0%,rgba(9,9,11,0.92)_75%,#09090b_100%)] z-10"
        />

        <div className="max-w-6xl w-full mx-auto text-center relative z-20 flex flex-col items-center">
          <h1 className="max-w-6xl w-full mx-auto font-display font-extrabold text-white tracking-tight leading-[1.06] text-[clamp(2.5rem,4.8vw,5.25rem)] mb-7">
            Cinema{' '}
            <span
              aria-hidden="true"
              className="inline-block w-20 sm:w-28 md:w-36 h-10 sm:h-12 md:h-14 rounded-full align-middle bg-cover bg-center mx-1.5 border border-white/25 grayscale contrast-125 shadow-xl"
              style={{
                backgroundImage:
                  'url("https://picsum.photos/seed/cinema-lens/600/300")',
              }}
            />{' '}
            indexed with critical{' '}
            <span
              aria-hidden="true"
              className="inline-block w-20 sm:w-28 md:w-36 h-10 sm:h-12 md:h-14 rounded-full align-middle bg-cover bg-center mx-1.5 border border-white/25 grayscale contrast-125 shadow-xl"
              style={{
                backgroundImage:
                  'url("https://picsum.photos/seed/film-archive/600/300")',
              }}
            />{' '}
            clarity.
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10">
            Discover feature films and series across OMDb and TMDB, compare IMDb, Rotten Tomatoes &amp; Metacritic ratings side by side, and curate your local Watchlist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
            <Link
              to="/movies"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] text-white rounded-2xl font-bold text-sm shadow-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d93829]"
            >
              <span>Browse Movies</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/watchlist"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-zinc-200 active:scale-[0.98] text-[#09090b] rounded-2xl font-bold text-sm shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span>My Watchlist</span>
            </Link>
          </div>
        </div>
      </section>

      {/* COMPONENT ARSENAL: Infinite Marquee of Cinema Standards & Index Capabilities */}
      <section
        aria-label="Supported cinema standards and index sources"
        className="w-full border-y border-zinc-200/80 dark:border-white/[0.08] bg-[#f0eee9] dark:bg-[#0d0d11] py-5 overflow-hidden"
      >
        <div className="animate-marquee flex items-center gap-12 px-6">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(({ label, Icon }, index) => (
            <div
              key={`${label}-${index}`}
              className="inline-flex items-center gap-3 text-zinc-700 dark:text-zinc-300 shrink-0"
            >
              <Icon size={20} weight="duotone" className="text-[#d93829]" aria-hidden="true" />
              <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AIDA STAGE 2: INTEREST — The Gapless 4x2 Bento Grid (grid-flow-dense) */}
      <section
        aria-labelledby="bento-architecture-heading"
        className="max-w-7xl w-full mx-auto px-6 md:px-10 py-32 md:py-48"
      >
        <div className="max-w-4xl mb-14">
          <h2
            id="bento-architecture-heading"
            className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]"
          >
            Built for serious film discovery.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Every search query, release year filter, and rating comparison is engineered for speed, keyboard accessibility, and zero-telemetry local storage.
          </p>
        </div>

        {/* Mathematically verified 4x2 grid: 4 + 2 + 1 + 1 = 8 cells, zero empty spaces */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[250px] grid-flow-dense gap-6">
          {/* Card 1: col-span-2 row-span-2 (4 cells) */}
          <article className="group relative lg:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden bg-[#121216] border border-zinc-200/80 dark:border-white/10 p-8 sm:p-10 flex flex-col justify-between min-h-[360px] text-white">
            <img
              src="https://picsum.photos/seed/cinema-projector-room/1920/1080"
              alt=""
              aria-hidden="true"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-35 contrast-125 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent"
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e84a3b] font-semibold">
                Tri-Source Consensus
              </span>
              <Link
                to="/movies?query=batman"
                aria-label="Compare movie ratings"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#09090b] hover:bg-[#d93829] hover:text-white transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="relative z-10 mt-auto">
              <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                IMDb, Rotten Tomatoes &amp; Metacritic in one ledger.
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-lg">
                Compare audience scores with critical consensus without opening three separate browser tabs. Missing or unindexed fields are cleanly suppressed.
              </p>
            </div>
          </article>

          {/* Card 2: col-span-2 row-span-1 (2 cells) */}
          <article className="group relative lg:col-span-2 lg:row-span-1 rounded-3xl overflow-hidden bg-white dark:bg-[#121216] border border-zinc-200/80 dark:border-white/10 p-7 sm:p-8 flex flex-col justify-between">
            <img
              src="https://picsum.photos/seed/film-negatives/1200/600"
              alt=""
              aria-hidden="true"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-15 dark:opacity-25 contrast-125 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="relative z-10 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#d93829] dark:text-[#e84a3b] font-semibold">
                Active Adapter: {providerId.toUpperCase()}
              </span>
              <Link
                to="/movies"
                className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white underline underline-offset-4 hover:text-[#d93829]"
              >
                Search Catalogue
              </Link>
            </div>

            <div className="relative z-10 mt-6">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white mb-1.5">
                Dual-Provider OMDb &amp; TMDB Architecture
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Toggle live between OMDb and TMDB adapters from the top bar with resilient local fallback when offline.
              </p>
            </div>
          </article>

          {/* Card 3: col-span-1 row-span-1 (1 cell) */}
          <article className="group relative lg:col-span-1 lg:row-span-1 rounded-3xl overflow-hidden bg-white dark:bg-[#121216] border border-zinc-200/80 dark:border-white/10 p-7 flex flex-col justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#d93829] dark:text-[#e84a3b] font-semibold">
              Offline Ready
            </span>
            <div className="mt-4">
              <h3 className="font-display text-xl font-bold text-zinc-950 dark:text-white mb-1.5">
                Local Watchlist
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Instant save, undoable removal, and portable JSON export and import.
              </p>
            </div>
          </article>

          {/* Card 4: col-span-1 row-span-1 (1 cell) */}
          <article className="group relative lg:col-span-1 lg:row-span-1 rounded-3xl overflow-hidden bg-[#d93829] text-white p-7 flex flex-col justify-between shadow-xl">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-white/90 font-semibold">
              URL-Synced State
            </span>
            <div className="mt-4">
              <h3 className="font-display text-xl font-bold text-white mb-1.5">
                Instant Combobox
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                Debounced typeahead suggestions and deep-linkable release year facets.
              </p>
            </div>
          </article>
        </div>

        {/* COMPONENT ARSENAL: Horizontal Accordions for Genre Exploration */}
        <div className="mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white">
                Curated Genre Dossiers
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Hover or select a slice to expand the repertory preview and jump straight into the search index.
              </p>
            </div>
          </div>

          <div
            role="region"
            aria-label="Interactive genre dossiers"
            className="flex flex-col lg:flex-row gap-4 min-h-[400px]"
          >
            {ACCORDION_PANELS.map((panel) => {
              const isExpanded = activeAccordion === panel.id;
              return (
                <div
                  key={panel.id}
                  onMouseEnter={() => setActiveAccordion(panel.id)}
                  onFocus={() => setActiveAccordion(panel.id)}
                  onClick={() => setActiveAccordion(panel.id)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveAccordion(panel.id);
                    }
                  }}
                  className={`group relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-white/10 bg-[#121216] text-white p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-[#d93829] ${
                    isExpanded ? 'lg:flex-[3.2]' : 'lg:flex-1'
                  }`}
                >
                  <img
                    src={panel.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity opacity-40 contrast-125 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/65 to-black/30"
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#e84a3b] font-semibold">
                      {panel.subtitle}
                    </span>
                  </div>

                  <div className="relative z-10 mt-12">
                    <h4 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                      {panel.title}
                    </h4>
                    <div
                      className={`overflow-hidden transition-all duration-500 ${
                        isExpanded ? 'max-h-40 opacity-100 mt-2' : 'lg:max-h-0 lg:opacity-0 max-h-40 opacity-100'
                      }`}
                    >
                      <p className="text-sm text-zinc-300 leading-relaxed mb-4 max-w-md">
                        {panel.description}
                      </p>
                      <Link
                        to={`/movies?query=${encodeURIComponent(panel.query)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#d93829] hover:bg-[#b82d20] px-4 py-2 text-xs font-bold text-white transition-colors"
                      >
                        <span>Explore {panel.query}</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AIDA STAGE 3: DESIRE — Scrubbing Text Reveal + GSAP Split Pinned Catalogue Showcase */}
      <section
        ref={scrubSectionRef}
        aria-label="Editorial philosophy"
        className="w-full bg-[#101014] text-white border-y border-white/[0.08] py-32 md:py-48 px-6 md:px-10"
      >
        <div className="max-w-5xl mx-auto">
          <p className="font-display text-2xl sm:text-4xl md:text-5xl font-bold leading-[1.22] tracking-tight text-white">
            {scrubWords.map((word, index) => (
              <span key={`${word}-${index}`} className="gsap-scrub-word inline-block mr-[0.28em]">
                {word}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* GSAP Split Scroll-Pinning Trending & Genre Repertory (F8) */}
      <section
        ref={splitSectionRef}
        aria-labelledby="trending-heading"
        className="max-w-7xl w-full mx-auto px-6 md:px-10 py-32 md:py-48"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Pinned Column on Desktop */}
          <div ref={splitPinLeftRef} className="lg:col-span-4 flex flex-col gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#d93829] dark:text-[#e84a3b] font-semibold block mb-2">
                Catalogue Spotlight ({providerId.toUpperCase()})
              </span>
              <h2
                id="trending-heading"
                className="font-display text-3xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-[1.06]"
              >
                Trending &amp; Acclaimed Releases
              </h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Filter the live repertory by genre or jump directly into the full search index.
              </p>
            </div>

            {/* Genre Filter Controls */}
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d93829] ${
                      active
                        ? 'bg-[#d93829] text-white shadow-md'
                        : 'bg-white dark:bg-[#121216] text-zinc-800 dark:text-zinc-200 border border-zinc-300/80 dark:border-white/10 hover:border-[#d93829]'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            <div>
              <Link
                to={
                  selectedGenre === 'All'
                    ? '/movies?query=batman'
                    : `/movies?query=${encodeURIComponent(selectedGenre)}`
                }
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-5 py-3 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Open Full Search Index</span>
              </Link>
            </div>
          </div>

          {/* Right Scrolling Gallery Column */}
          <div className="lg:col-span-8">
            {loadingTrending ? (
              <ResultGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {trendingItems.map((movie) => (
                  <div key={movie.imdbID} className="gsap-scale-media">
                    <MovieCard
                      curMovie={movie}
                      navigateToMovie={() => navigate(`/movies/${movie.imdbID}`)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;