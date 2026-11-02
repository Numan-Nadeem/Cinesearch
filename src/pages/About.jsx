import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from '@phosphor-icons/react';
import { useDocumentMeta } from '../lib/seo.js';
import { MEDIA_PROVENANCE } from '../design/mediaProvenance.js';

const PILLARS = [
  {
    title: 'Three-source consensus',
    meta: 'IMDb · Rotten Tomatoes · Metacritic',
    body: 'Rather than relying on a single opaque score, CineSearch aggregates IMDb audience ratings, Rotten Tomatoes Tomatometer scores, and Metacritic Metascores side by side so you can weigh critical reception against audience sentiment at a glance.',
  },
  {
    title: 'Dual-catalogue engine',
    meta: 'OMDb & TMDB Adapters · URL-Synchronized State',
    body: 'Switch seamlessly between the OMDb and TMDB catalogue adapters. Every search query, release-year filter, and content-type facet is synchronized with the URL so any view can be bookmarked or shared cleanly.',
  },
  {
    title: 'Local-first privacy',
    meta: 'Zero Telemetry · Portable JSON Watchlist',
    body: 'Your Watchlist and recent search history live exclusively in your browser storage, never on a remote tracking server. Export your curated collection as portable JSON or install CineSearch as a Progressive Web App for offline browsing.',
  },
];

export default function About() {
  const [avatarSrc, setAvatarSrc] = useState(MEDIA_PROVENANCE.creatorAvatar.url);

  useDocumentMeta({
    title: 'About CineSearch — Architectural Monograph & Colophon',
    description:
      'Learn about CineSearch — our mission to connect film enthusiasts with cinema worth their time through multi-source ratings and fast discovery.',
  });

  return (
    <div className="flex-1 pt-12 pb-24 md:pt-16 md:pb-32 px-5 sm:px-8 max-w-[1360px] mx-auto w-full animate-editorial-in">
      {/* Back Navigation Breadcrumb */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#494540] dark:text-[#b5b0a8] hover:text-[#c83a2b] dark:hover:text-[#d94636] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          <span>Return to Repertory Index</span>
        </Link>
      </div>

      {/* Editorial Monograph Header — 12-Col Balanced Split */}
      <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pb-16">
        <div className="lg:col-span-6">
          <h1 className="font-display text-[#161514] dark:text-white text-3xl sm:text-5xl font-bold tracking-[-0.03em] leading-[1.03]">
            Cinema beyond the algorithm.
          </h1>
        </div>
        <div className="lg:col-span-6">
          <p className="editorial-dropcap text-[#161514] dark:text-[#f2efe9] text-base sm:text-lg leading-relaxed max-w-[62ch]">
            At CineSearch, our mission is to connect film enthusiasts with cinema worth their time. Built as a fast, distraction-free repertory index, CineSearch pairs archival metadata with instant search and private local curation.
          </p>
        </div>
      </header>

      {/* Architectural Pillars */}
      <section
        aria-labelledby="pillars-heading"
        className="py-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-12">
          <div className="lg:col-span-6">
            <h2
              id="pillars-heading"
              className="font-display text-2xl sm:text-4xl font-bold text-[#161514] dark:text-white tracking-[-0.02em] leading-[1.06]"
            >
              Three architectural pillars.
            </h2>
          </div>
          <div className="lg:col-span-6">
            <p className="text-base text-[#494540] dark:text-[#b5b0a8] leading-relaxed">
              Every record in the index is normalized across dual adapters and stored locally without accounts or behavioural tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.title}
              className="p-6 sm:p-10 bg-[#ebe6dc] dark:bg-[#151519] grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start"
            >
              <div className="md:col-span-5">
                <h3 className="font-display text-2xl font-bold text-[#161514] dark:text-white mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs font-semibold text-[#c83a2b] dark:text-[#d94636]">
                  {pillar.meta}
                </p>
              </div>
              <div className="md:col-span-7">
                <p className="text-[#161514] dark:text-[#f2efe9] text-base sm:text-lg leading-relaxed max-w-[62ch]">
                  {pillar.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Creator Dossier & Archival Still */}
      <section
        aria-labelledby="creator-heading"
        className="pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start"
      >
        <div className="lg:col-span-5">
          <figure className="overflow-hidden bg-[#ebe6dc] dark:bg-[#151519]">
            <div className="aspect-[16/10] w-full overflow-hidden">
              <img
                src={MEDIA_PROVENANCE.editorialStills[1].url}
                alt="35mm motion picture reel and optical lens inspection"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale contrast-125"
              />
            </div>
            <figcaption className="px-4 py-3 text-xs text-[#494540] dark:text-[#b5b0a8] flex items-center justify-between gap-2">
              <span>35mm Optical Inspection Plate</span>
              <span className="truncate">
                {MEDIA_PROVENANCE.editorialStills[1].credit}
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <h2
            id="creator-heading"
            className="font-display text-2xl sm:text-4xl font-bold text-[#161514] dark:text-white tracking-[-0.02em] leading-[1.06]"
          >
            Independent film curation.
          </h2>
          <p className="text-[#161514] dark:text-[#f2efe9] text-base sm:text-lg leading-relaxed max-w-[62ch]">
            CineSearch was created by Numan Nadeem with a straightforward premise: film discovery should not require wading through algorithmic clutter or creating yet another cloud account. What began as a streamlined search utility has evolved into a resilient, dual-provider cinema companion built on open web standards.
          </p>

          {/* Creator Photo Avatar Card */}
          <div className="flex items-center gap-4 py-4 px-5 bg-[#ebe6dc] dark:bg-[#151519] max-w-md">
            <img
              src={avatarSrc}
              alt="Numan Nadeem"
              onError={() => setAvatarSrc(MEDIA_PROVENANCE.creatorAvatar.fallbackPhoto)}
              referrerPolicy="no-referrer"
              className="w-14 h-14 object-cover shrink-0 bg-[#1d1d23]"
            />
            <div>
              <div className="font-display font-bold text-base text-[#161514] dark:text-white">
                {MEDIA_PROVENANCE.creatorAvatar.name}
              </div>
              <div className="text-xs text-[#494540] dark:text-[#b5b0a8]">
                Creator &amp; Full-Stack Engineer · MIT License
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 bg-[#c83a2b] hover:bg-[#a92e21] active:scale-[0.98] px-6 py-3 text-xs font-semibold text-white transition-all"
            >
              <span>Explore the Catalogue</span>
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#ebe6dc] dark:bg-[#151519] hover:bg-[#e2dcd0] dark:hover:bg-[#1d1d23] text-[#161514] dark:text-white px-6 py-3 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              <span>Send Curatorial Dispatch</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
