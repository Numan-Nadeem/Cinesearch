# CineSearch 2.0

**CineSearch** is a modern, resilient React single-page application for discovering movies and TV shows. It supports multi-provider catalogue exploration (OMDb and TMDB), URL-synced search state, TanStack Query caching & deduplication, a persistent local-first Watchlist with JSON import/export, enriched multi-source ratings, tri-state theming, and offline-ready Progressive Web App (PWA) support.

---

## Features

- **URL-Synced Search State (F1)** — Every search query, release year filter, content type (`All`, `movie`, `series`, `episode`), and page state is reflected in the URL (`/movies?query=alien&year=1979&type=movie`), making links shareable and browser back/forward navigation deterministic.
- **Local Watchlist (F2)** — Save titles from any search card or details page into `cinesearch:watchlist` with zero backend or account requirements, complete with live navbar counter badge, undoable removals, and JSON export/import.
- **Enriched Details & Social Sharing (F3)** — Side-by-side comparison of IMDb, Rotten Tomatoes, and Metacritic ratings, awards, box office, language, country, cast & crew credits, YouTube trailer lookup/embed, dynamic Open Graph metadata, and one-click link sharing.
- **Resilient Query & Caching Layer (F4)** — Powered by `@tanstack/react-query` (`useInfiniteQuery`) with 5-minute stale cache, session storage persistence, automatic retry with backoff for transient 5xx/network errors, `AbortController` cancellation, and a typed error taxonomy (`quota`, `network`, `not-found`, `upstream`).
- **Autocomplete Suggestions & Recent Searches (F5)** — Accessible (`role="combobox"`) debounced 300ms autocomplete suggestions after 3 characters and recent search history (`cinesearch:recent-searches`).
- **Tri-State Theme Toggle (F6)** — Switch seamlessly between Dark, Light, and System themes with pre-hydration flash prevention, WCAG AA contrast across Tailwind and Material UI surfaces, and `prefers-reduced-motion` support.
- **Installable PWA & Offline Support (F7)** — Pre-cached application shell, bounded runtime poster caching, offline connectivity banner, and an in-app install prompt.
- **Dual-Provider Adapter Architecture (F8)** — Clean provider interface (`search`, `details`, `image`, `trending`, `genres`) supporting both `omdb` and `tmdb` behind `VITE_DATA_PROVIDER` or an interactive provider switcher.

---

## Quickstart (Under 5 Minutes)

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Numan-Nadeem/Cinesearch.git
   cd Cinesearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your server-side API keys in `.env` (optional for local development — deterministic curated catalogue data is built in when keys are omitted):
   ```env
   OMDB_API_KEY=your_omdb_api_key
   TMDB_API_KEY=your_tmdb_api_key
   VITE_DATA_PROVIDER=omdb
   ```

4. **Start the development server**
   The Vite server includes an integrated dev middleware for `/.netlify/functions/omdb-proxy` and `/.netlify/functions/tmdb-proxy`, or you can run `netlify dev`:
   ```bash
   npm run dev
   # Or with Netlify CLI:
   npx netlify-cli dev
   ```

5. **Run Unit Tests & Linter**
   ```bash
   npm test
   npm run lint
   ```

---

## Architecture Overview

```text
src/
  api/                  # Provider adapters (omdbAdapter, tmdbAdapter), error taxonomy, unit tests
  lib/                  # TanStack Query client + session persistence, SEO/head helpers, formatters
  hooks/                # useMovieSearch, useDebounce, useLocalStorage, useTheme, usePWAInstall
  context/              # WatchlistProvider and ThemeProvider
  components/
    ui/                 # MovieCard, RatingRow, Skeleton, ErrorState, EmptyState, ThemeToggle
    layout/             # Navbar, Footer, AppLayout, ErrorBoundary
    features/           # SearchBar, ResultGrid, WatchlistButton, ShareRow, PWAInstallButton
  pages/                # Home, Movie, MovieDetails, Watchlist, About, Contact, NotFound
netlify/functions/      # omdb-proxy.js and tmdb-proxy.js serverless functions
public/                 # Favicon, SVG icon, PWA icons, static assets
```

---

## License

Released under the [MIT License](./LICENSE).
