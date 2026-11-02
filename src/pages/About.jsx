import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDocumentMeta } from '../lib/seo.js';

const PILLARS = [
  {
    title: 'Multi-Source Critical Consensus',
    body: 'Rather than relying on a single opaque score, CineSearch aggregates IMDb audience ratings, Rotten Tomatoes Tomatometer scores, and Metacritic Metascores side by side so you can weigh critical reception against audience sentiment at a glance.',
  },
  {
    title: 'Dual-Catalogue Architecture',
    body: 'Switch seamlessly between the OMDb and TMDB catalogue adapters directly from the navigation bar. Every search query, release-year filter, and content-type facet is synchronized with the URL so any view can be bookmarked or shared cleanly.',
  },
  {
    title: 'Local-First Privacy & Offline Access',
    body: 'Your Watchlist and recent search history live exclusively in your browser storage, never on a remote tracking server. Export your curated collection as portable JSON or install CineSearch as a Progressive Web App for offline browsing.',
  },
];

export default function About() {
  useDocumentMeta({
    title: 'About CineSearch',
    description:
      'Learn about CineSearch — our mission to connect movie enthusiasts with films they love through multi-source ratings and fast discovery.',
  });

  return (
    <div className="flex-1 py-24 md:py-32 px-6 md:px-10 max-w-6xl mx-auto w-full">
      {/* Wide Editorial Header */}
      <header className="max-w-5xl pb-20 border-b border-zinc-200/90 dark:border-white/[0.08]">
        <h1 className="max-w-5xl font-display text-zinc-950 dark:text-white text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
          About CineSearch
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-lg sm:text-xl leading-relaxed max-w-3xl">
          At CineSearch, our mission is to connect film enthusiasts with cinema worth their time. Built as a fast, distraction-free repertory index, CineSearch pairs archival metadata with instant search and private local curation.
        </p>
      </header>

      {/* Architectural Pillars */}
      <section aria-label="Core principles" className="py-24 border-b border-zinc-200/90 dark:border-white/[0.08]">
        <div className="divide-y divide-zinc-200/80 dark:divide-white/[0.08]">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="py-10 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline"
            >
              <div className="md:col-span-5">
                <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white">
                  {pillar.title}
                </h2>
              </div>
              <div className="md:col-span-7">
                <p className="text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed max-w-[65ch]">
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story & Call to Action */}
      <section className="pt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <h2 className="font-display text-3xl font-bold text-zinc-950 dark:text-white">
            Our Story
          </h2>
        </div>
        <div className="lg:col-span-7 space-y-6">
          <p className="text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed max-w-[65ch]">
            CineSearch was founded in 2025 by Numan Nadeem with a straightforward premise: film discovery should not require wading through algorithmic clutter or creating yet another cloud account. What began as a streamlined search utility has evolved into a resilient, dual-provider cinema companion built on open web standards.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#d93829] hover:bg-[#b82d20] active:scale-[0.98] px-7 py-3.5 text-sm font-bold text-white transition-all shadow-lg"
            >
              <span>Explore the Catalogue</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300/80 dark:border-white/20 bg-white dark:bg-white text-zinc-950 px-6 py-3.5 text-sm font-bold hover:bg-zinc-100 active:scale-[0.98] transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
