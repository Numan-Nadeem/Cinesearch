# CineSearch — Product & Engineering Specification

> **Repository:** github.com/Numan-Nadeem/Cinesearch
> **Basis:** Static code review of the current `main` branch
> **Document version:** 1.0 — November 2026
> **Audience:** Maintainers, contributors and technical reviewers

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State: Architecture and Behavior](#2-current-state-architecture-and-behavior)
3. [Issue Register: Defects and Technical Debt](#3-issue-register-defects-and-technical-debt)
4. [Goals, Principles and Non-Goals](#4-goals-principles-and-non-goals)
5. [Feature Specifications: Eight Ranked Capabilities](#5-feature-specifications-eight-ranked-capabilities)
6. [Target Architecture and Data Design](#6-target-architecture-and-data-design)
7. [Implementation Roadmap: Four Phases](#7-implementation-roadmap-four-phases)
8. [Testing, Quality Assurance and CI/CD](#8-testing-quality-assurance-and-cicd)
9. [Risks and Mitigations](#9-risks-and-mitigations)
10. [Success Metrics and Measurement Plan](#10-success-metrics-and-measurement-plan)
- [Appendix A: Detailed Issue Register](#appendix-a-detailed-issue-register-cs-01-to-cs-24)

---

## 1. Executive Summary

CineSearch is an open-source React single-page application for discovering movies and TV shows, powered by the OMDb API through a Netlify serverless function that keeps the API key off the client. This specification is based on a complete static review of the repository and defines four things: the defects and technical debt that should be remediated, eight ranked feature specifications, a target architecture, and a phased implementation roadmap with exit criteria.

The review tracked **24 issues**. Five are high-severity: the movie details route loader swallows errors and can crash the details page; the documented local quickstart cannot reach the API because the request proxy lives in Netlify Functions; OMDb responses report missing artwork as the literal string `N/A`, which renders as broken images; API failures such as daily quota exhaustion are displayed to users as no-results messages; and the infinite-scroll observer is re-created on every state change, which can double-fetch pages. The remainder are medium- and low-severity items covering deployment configuration, performance, accessibility, search-engine visibility and code hygiene.

**Three recommendations anchor the roadmap.** First, stabilize before building: the high-severity fixes are small and surgical, and every one of them erodes trust in the product today. Second, make the data layer resilient and frugal: adopting TanStack Query for caching, request de-duplication and retries protects the 1,000 requests per day limit of the free OMDb key while making repeat views instantaneous. Third, migrate content depth to TMDB behind a provider adapter: OMDb caps the product ceiling because it offers no trailers, cast pages, genre browsing, trending lists or sized images, while TMDB provides all of these on generous per-second rate limits; an adapter preserves OMDb where it is strongest (aggregated ratings from IMDb, Metascore and Rotten Tomatoes) and unlocks TMDB everywhere else.

Executed in order, the roadmap targets a crash-free session rate of at least 99.5%, Lighthouse performance and accessibility scores of 90 or higher, an initial JavaScript payload of at most 250 KB compressed, and durable user value through a persistent watchlist and shareable search links — all without introducing a backend, accounts or paid services.

---

## 2. Current State: Architecture and Behavior

### 2.1 Product Overview

CineSearch presents a dark, cinematic interface across six screens: a video hero landing page, a search page with year and type filters plus infinite scrolling, a movie details page, a static about page, a contact card linking to the author's profiles, and a terminal-styled 404 page. The application is deployed at `cinesearchpk.netlify.app`. All catalogue data comes from a single provider, the OMDb API, and every request passes through a Netlify Function so the API key never reaches the browser. The project is young — three commits on `main` at the time of review — which makes now the cheapest moment to correct course.

### 2.2 Technology Stack

**Table 1 — Technology stack as declared in `package.json`**

| Layer | Technology | Version | Review observation |
|---|---|---|---|
| UI framework | React + ReactDOM | 18.3 | Stable; no React 19 migration pressure yet |
| Build tooling | Vite | 5.4 | Fine; no proxy or visualizer configured |
| Routing | react-router-dom | 7.7 | Data routers used well (loader, errorElement) |
| Styling | Tailwind CSS 4 + MUI 7 + one SCSS file | 4.1 / 7.2 | Three styling systems coexist; MUI theme is minimal (font only) |
| Animation | motion (imported as framer-motion) | 12.x | Imported from a package that is not a direct dependency |
| HTTP | Native fetch | — | axios is declared but never imported |
| Fonts | @fontsource/poppins | 5.x | index.html also loads Inter, which is unused |
| Serverless backend | Netlify Function `omdb-proxy` | — | Correct pattern: hides OMDb key server-side |
| Data provider | OMDb API (free tier) | — | 1,000 requests/day; 10 results per search page |
| Testing / CI | None | — | Zero tests, no pipeline; lint script exists but is not enforced |

### 2.3 Runtime Behavior and Data Flow

Search works as follows. The form on the Movie page collects a title term, an optional four-digit year and a content type (movie, series, episode or all). Submission calls `getMoviesData` in `src/api/getMoviesData.js`, which performs a GET request against the Netlify Function at `/.netlify/functions/omdb-proxy` with `searchTerm`, `year`, `type` and `page` parameters. The function (`netlify/functions/omdb-proxy.js`) validates the calling origin against a hardcoded allowlist containing only the production Netlify domain, reads the API key from the `VITE_MOVIE_API_KEY` environment variable, calls the OMDb search endpoint and relays the JSON body back. OMDb returns at most ten result records per page together with a `totalResults` count.

Additional results load through an `IntersectionObserver` attached to a wrapper around the last card in the grid; when it becomes visible, the page counter increments and another page is appended. The full result set, search term, year, type and total count are mirrored into five `sessionStorage` keys and restored on mount so that a navigation to a details page and back does not lose the list. The details route uses a React Router loader (`getMoviesDetails` in `src/api/getMovieDetails.js`) that fetches the item by IMDb ID through the same proxy; `AppLayout` renders a full-page spinner whenever router navigation is in the loading state.

**Table 2 — Route inventory**

| Route | Component | Data source | Notes |
|---|---|---|---|
| `/` | `pages/Home.jsx` | Static video hero | 2.9 MB MP4 background, autoplaying |
| `/movies` | `pages/Movie.jsx` | omdb-proxy search endpoint | Form, filters, infinite scroll, sessionStorage mirror |
| `/movies/:movieID` | `pages/MovieDetails.jsx` | omdb-proxy details endpoint via route loader | No error or not-found handling on bad IDs |
| `/about` | `pages/About.jsx` | Static copy | Claimed 2025 founding; no data |
| `/contact` | `pages/Contact.jsx` | Static links | 1.8 MB JPEG background |
| `*` (error) | `pages/NotFound.jsx` | Static | Terminal-styled 404; hotlinks a Giphy asset |

### 2.4 Deployment and Developer Workflow

`netlify.toml` registers only the functions directory; the build command, publish directory, SPA fallback redirect and security headers are all left to Netlify's framework auto-detection. A `Dockerfile` exists but its command runs the Vite development server rather than a production build. The README quickstart instructs contributors to run `npm run dev` and open port 5173 — but the application's only API path is `/.netlify/functions/omdb-proxy`, which exists under `netlify dev` or in production and nowhere else, so a fresh clone following the documented steps produces an application whose every search fails. This single gap (issue CS-02) is the largest contributor friction in the project and is the first item in the roadmap.

### 2.5 Strengths Worth Preserving

Four decisions should be kept and built upon rather than replaced. The serverless proxy is the right security posture — the OMDb key is unreadable from the browser, and the same pattern extends naturally to a second provider. The data-router usage (loaders, an error element, a navigation-state spinner) is idiomatic React Router 7 and already gives details pages a loading UX. The visual identity — dark surfaces, glassy controls, cinematic imagery, a characterful 404 — is coherent and distinctive. And the application is genuinely responsive, with considered mobile layouts throughout.

---

## 3. Issue Register: Defects and Technical Debt

### 3.1 Severity Summary

Static review of every source file, the deployment configuration and the README produced **24 tracked issues**, catalogued in full in Appendix A. Severity reflects user impact: **P1** issues break correctness, trust or onboarding today; **P2** issues degrade quality, performance or security posture; **P3** issues are hygiene that raises the cost of every future change.

**Table 3 — Severity summary (full detail in Appendix A)**

| Severity | Count | Representative issues | Primary cost of inaction |
|---|---|---|---|
| P1 — critical | 5 | Details loader crash (CS-01); broken local onboarding (CS-02); N/A posters (CS-03); error conflation (CS-04); scroll observer races (CS-06) | Crashes, dead contributors, misleading UX |
| P2 — significant | 12 | No SPA redirect (CS-08); VITE_ secret naming (CS-09); 2.9 MB hero video (CS-14); unlabeled controls (CS-17); no per-page titles (CS-18) | Deploy fragility, security foot-guns, poor Core Web Vitals, a11y gaps |
| P3 — hygiene | 7 | Package misnamed toggle-switch (CS-13); dead dependencies (CS-20); missing LICENSE (CS-22) | Repo credibility, review noise, onboarding confusion |

### 3.2 High-Severity Findings

- **CS-01 — details loader swallows failures.** `getMovieDetails` catches every error, logs it and returns `undefined`; `MovieDetails.jsx` then dereferences `movieData.Poster` and `movieData.Title` unconditionally. Any proxy failure, network drop, quota exhaustion or invalid ID therefore renders a blank screen inside the layout instead of an error state. OMDb success responses that carry `Response: "False"` (unknown IDs) are likewise never checked.
- **CS-02 — the documented quickstart cannot work.** The README directs contributors to `npm run dev` on port 5173, but all data calls target the Netlify Functions path. Without `netlify dev` (never mentioned in the README), every search returns a failed fetch which the UI reports as no results.
- **CS-03 — missing artwork renders as broken images.** OMDb reports absent posters as the literal string `N/A`. `MovieCard` and `MovieDetails` pass that string straight into the `img src`, so result grids for older or obscure titles are sprinkled with broken-image icons.
- **CS-04 — every failure reads as no results.** `getMoviesData` normalizes errors to the OMDb failure shape, and the Movie page renders any `Response: "False"` identically: a sad-face icon with text claiming no movies were found. When the daily quota is exhausted or the network is down, users are told their search was empty.
- **CS-06 — the infinite-scroll observer is unstable.** The effect that owns the `IntersectionObserver` lists seven dependencies, so it tears down and re-creates the observer on nearly every state change; re-observing an element that is already on screen fires the callback again. The fetch closure has no abort or request token, so page requests can overlap or double-fire and append duplicate cards on slow connections.

### 3.3 Medium and Low Findings in Brief

**Configuration and deployment:** `netlify.toml` declares no SPA fallback redirect, so deep links such as `/movies/tt0111161` depend on Netlify auto-detection to survive a refresh (CS-08). The server-side secret is named with the `VITE_` prefix, which by Vite convention marks a variable as safe to inline into the client bundle — a naming foot-gun that should become `OMDB_API_KEY` (CS-09). The proxy's CORS allowlist hardcodes a single production origin with a `null` fallback and no localhost or deploy-preview entries (CS-10). The Dockerfile ships a dev server instead of a production build (CS-11), and two lockfiles (`bun.lock` and `package-lock.json`) are committed simultaneously, inviting dependency drift (CS-12).

**Performance:** the landing page autoplays a 2.9 MB MP4 with no poster frame, and page backgrounds add another 2.9 MB of unoptimized JPEG, of which one file (`contact_bg.jpg`, 336 KB) is entirely unused (CS-14). Poster images in result grids load eagerly with no lazy attribute (CS-15). All routes ship in one JavaScript chunk containing MUI and the animation library, though three pages are static (CS-16).

**Accessibility and SEO:** the year input and type select are placeholder-labeled rather than properly labeled, the landing-page call-to-actions are anchors without `href` and therefore unreachable by keyboard, the autoplaying video honors no reduced-motion preference, `document.title` never changes per page, and no meta description or Open Graph tags exist (CS-17, CS-18).

**Hygiene:** `package.json` still carries the template name `toggle-switch` with no license field while the README links a LICENSE file that does not exist; axios and styled-components are declared but never imported; `App.css` is unimported Vite template residue; a `console.log` ships in the details page; the 404 page hotlinks a Giphy asset; and the Navbar imports `framer-motion` — a transitive dependency of `motion` — rather than the package's own entry point (CS-07, CS-13, CS-19 through CS-22, CS-24).

---

## 4. Goals, Principles and Non-Goals

**Goals for version 2.0.** Eliminate every crash path reachable through normal use; make a fresh clone productive within five minutes; reach Lighthouse scores of 90 or higher on performance and accessibility for the search and details pages; cut network requests per repeat session by at least 40% through caching; make every application state shareable by URL; and give users persistent personal value (a watchlist) without requiring accounts.

**Principles.** *Progressive enhancement* — every feature must degrade gracefully when the API, quota or network is unavailable. *Secret hygiene* — nothing sensitive is ever named or shipped in a way that could reach the client bundle. *Provider independence* — all catalogue data flows through one adapter interface, so no feature is welded to OMDb or TMDB specifics. *Accessibility as a gate, not a retrofit* — keyboard operability and labeled controls are acceptance criteria, not cleanup tasks. *Small surface* — remove a dependency for every one added where possible. *Ship behind flags* — risky migrations land dark and flip when instrumented.

**Non-goals for this cycle.** No user accounts, authentication or synchronization backend (the watchlist is local-first). No user-generated content such as reviews, which would introduce moderation obligations. No native or desktop packaging. No paid API tiers — the design must live inside free quotas. No visual redesign — the existing identity is an asset and is preserved.

---

## 5. Feature Specifications: Eight Ranked Capabilities

Eight features follow, ordered by the roadmap in which they land. **Table 4** summarizes value, effort and phase. Effort is sized for one maintainer on a part-time cadence: **S** is a focused day or less, **M** is two to four days, **L** is one to two weeks including verification.

**Table 4 — Feature matrix**

| ID | Feature | Primary user value | Effort | Phase | Depends on |
|---|---|---|---|---|---|
| F1 | URL-synced search state | Shareable, bookmarkable, back-button-correct searches | M | 1 | — |
| F2 | Local watchlist | Persistent personal value without accounts | M | 2 | — |
| F3 | Enriched details page | Full ratings, share and per-page titles | M | 2 | F1 |
| F4 | Resilient API layer | Instant repeat views; honest errors; quota survival | L | 1 | — |
| F5 | Search suggestions and recent searches | Type less, find faster | M | 2 | F4 |
| F6 | Theme toggle | Comfortable use in any lighting | S | 2 | — |
| F7 | PWA and offline support | Installable, resilient on flaky networks | M | 3 | F4 |
| F8 | TMDB provider migration | Trending, genres, cast pages, trailers, sized images | L | 3 | F4 |

### 5.1 F1 — URL-Synced Search State

Today a search exists only in component state and a sessionStorage mirror, so it cannot be shared, bookmarked or restored after a crash, and the browser back button behaves unpredictably after paginated scrolling. This feature moves the full search state — term, year, type and page — into the URL query string of `/movies`, making the address bar the single source of truth and deleting the sessionStorage mirror entirely (which also resolves CS-05).

> **User story:** As a movie lover, I want to send a friend a link that opens CineSearch with my search, filters and scroll position already applied, so that they land exactly where I was.

**Acceptance criteria**

- [ ] The URL `/movies?query=alien&year=1979&type=movie` restores the exact result set, filter controls and visible page count on cold load.
- [ ] Browser back and forward step through search states without duplicate history entries per keystroke; submissions push, typing does not.
- [ ] Navigating to `/movies` with no parameters shows the untouched empty state, not a stale or restored search.
- [ ] Restoring a deep link triggers the same loading, empty and error states as an interactive search, including quota errors.
- [ ] sessionStorage search keys are removed; no behavior regresses for in-app navigation between results and details.

**Technical notes.** Implement with `useSearchParams` in the Movie page; derive all filter state from params and write on submit. Data fetching keys on the parsed params object (see F4), so URL, cache and UI stay in lockstep. Add scroll restoration for the result grid keyed on the params string.

### 5.2 F2 — Local Watchlist

A watchlist converts one-shot visits into a reason to return, without any backend. Titles can be saved from result cards and the details page, and managed on a dedicated route. Storage is namespaced localStorage, deliberately capped and exportable so users own their data.

> **User story:** As a casual viewer, I want to save titles I encounter to a list I can revisit, so that deciding what to watch tonight takes seconds instead of another search session.

**Acceptance criteria**

- [ ] A toggle control on every result card and the details page adds or removes the title, reflects current state, and is keyboard operable with a visible focus ring.
- [ ] A `/watchlist` route lists saved titles with poster, year and type, links to details, and supports removal and empty-state messaging with a call to action.
- [ ] The navbar gains a watchlist entry with a live count badge that updates immediately on add or remove.
- [ ] The list persists across sessions in namespaced localStorage (`cinesearch:watchlist`), survives quota exhaustion (no API call to render), and offers JSON export and import.
- [ ] Adding or removing produces an unobtrusive confirmation toast; destructive actions are reversible for at least the toast duration.

**Technical notes.** Ship a `WatchlistProvider` context over a `useLocalStorage` hook storing an array of IMDb IDs plus the summary fields the OMDb search already returns (title, year, type, poster) — rendering the list costs zero additional API requests. Cap stored entries at a few hundred to bound storage.

### 5.3 F3 — Enriched Details Page

The details page currently shows the IMDb rating, Metascore and box office, a genre chip row, plot and three credit lines. OMDb already returns more that goes unrendered: the full `Ratings` array (IMDb, Metacritic and Rotten Tomatoes side by side), language, country, awards, rated classification, DVD and production metadata, and season/episode identity for series entries. This feature renders the complete picture, suppresses fields the provider marks `N/A` instead of displaying them, and adds sharing: per-page document titles and Open Graph tags so links unfurl with the poster, plus copy-link and social share actions.

> **User story:** As a viewer comparing what to watch, I want every rating source, the awards and the language of a title on one page, and I want to share that page as a rich link, so that my friends see what I am recommending.

**Acceptance criteria**

- [ ] The `Ratings` array renders as a comparison row (source, value) with IMDb, Metacritic and Rotten Tomatoes labels; missing sources are omitted, not shown as N/A.
- [ ] Language, country, awards, production and content rating render when present; every field marked N/A by the provider is hidden with no empty rows.
- [ ] `document.title` becomes the title and year on the details route and restores on unmount; Open Graph and Twitter card tags carry title, year, plot excerpt and poster.
- [ ] Copy-link and share actions for major social destinations appear on the page; copy confirms visually.
- [ ] A trailer affordance links out to a YouTube search for the title and year until an embeddable source arrives with F8.

**Technical notes.** Keep the existing route loader but normalize its payload (Section 6.2) so components never branch on provider quirks. Meta tags are written imperatively from an effect or a tiny head utility — no new dependency is required for tags, and none should be added.

### 5.4 F4 — Resilient API and Caching Layer

This is the keystone engineering feature: the application adopts TanStack Query as its data layer. Today every page view refetches, back navigation re-requests, and failures are indistinguishable from empty results. A query cache with request de-duplication, bounded persistence and typed errors simultaneously fixes the honesty of failure states, makes repeat navigation instantaneous, and stretches the 1,000 request daily OMDb quota by a large factor. It also replaces the hand-rolled IntersectionObserver pagination with `useInfiniteQuery`, eliminating the race conditions catalogued in CS-06.

> **User story:** As a returning visitor, I want pages I have already seen to appear instantly and to be told the truth — quota exhausted, network down, or genuinely nothing found — so that I stop guessing what went wrong.

**Acceptance criteria**

- [ ] Identical searches within the stale window (five minutes) are served from cache with zero network requests; concurrent identical requests are de-duplicated to one.
- [ ] Transit and server errors (5xx, network) retry automatically twice with exponential backoff; 4xx and provider failures do not retry.
- [ ] Quota exhaustion renders a persistent, distinct banner explaining the daily limit with a retry-later affordance — never the empty-results state (resolves CS-04).
- [ ] Search pagination uses `useInfiniteQuery`; scrolling cannot produce duplicate or interleaved pages; aborted or superseded requests are cancelled via `AbortController`.
- [ ] The cache persists to sessionStorage with a bounded size and is invalidated on hard reload; a quota or outage state degrades gracefully with cached content still shown.
- [ ] All request failures normalize to a typed error taxonomy — quota, network, not-found, upstream — consumed uniformly by the UI.

**Technical notes.** Create one `QueryClient` in `src/lib` with sensible defaults (staleTime five minutes, garbage collection thirty minutes, one retry for idempotent GETs). Query keys are structured as `[provider, resource, params]`. The Netlify function gains a small addition: map OMDb daily-limit responses to HTTP 429 so the client can classify them without parsing provider prose.

### 5.5 F5 — Search Suggestions and Recent Searches

Typing a full title is the highest-friction interaction in the product. A debounced suggestion dropdown, fed by the same OMDb search endpoint the form already uses, shortens the path from intent to results, and a recent-searches list removes it entirely for repeat intent.

> **User story:** As a user with a half-remembered title, I want the search box to complete it for me and to remember what I searched yesterday, so that finding a film takes one gesture.

**Acceptance criteria**

- [ ] After three typed characters, a debounced (300 ms) dropdown offers up to eight title suggestions with year and type; requests are aborted when input changes mid-flight.
- [ ] The dropdown is fully keyboard operable (arrows, enter, escape) with correct combobox roles, live region announcement, and visible focus.
- [ ] Focusing an empty input shows up to eight recent searches from namespaced localStorage; selecting one re-runs the search.
- [ ] Suggestion requests hit the same cached query keys as full searches, so suggesting costs no additional quota for already-seen terms.
- [ ] The dropdown never obscures the submit control and closes on outside click and blur without losing the pending term.

**Technical notes.** A `useDebounce` hook plus an `AbortController` per keystroke is sufficient; suggestions reuse F4's query cache. Recent searches store only term plus filter tuple (eight entries, LRU).

### 5.6 F6 — Theme Toggle

The product is dark-only by design, which suits cinematic browsing but punishes bright-room and low-vision users who need lighter surfaces. A persisted, tri-state theme (light, dark, follow system) adds comfort and accessibility without surrendering the brand.

> **User story:** As a user browsing in daylight, I want a light theme, so that reading plots does not mean squinting at a dark screen.

**Acceptance criteria**

- [ ] A navbar control cycles light, dark and system with icons; the choice persists in namespaced localStorage and defaults to the OS preference.
- [ ] One source of truth drives both Tailwind's dark variant and the MUI theme — no page ships mixed themes, including MUI select menus and chips.
- [ ] Core pages pass WCAG AA contrast in both themes; the hero video is permitted to keep its cinematic overlay.
- [ ] A pre-hydration script applies the stored theme before first paint — no light-flash when the stored theme is dark.
- [ ] All motion respects `prefers-reduced-motion`; the autoplaying hero pauses (CS-17 partial).

**Technical notes.** Toggle a class on the document root from a ThemeProvider; extend `src/theme.js` into two MUI theme objects. Tailwind 4's dark variant is configured to class strategy in the Vite plugin.

### 5.7 F7 — PWA and Offline Support

CineSearch is a natural install-on-the-home-screen app: a lookup tool used briefly and repeatedly. A service worker turns repeat visits into instant ones and keeps the shell usable when connectivity drops — the exact failure mode of mobile browsing on the move.

> **User story:** As a commuter, I want to open CineSearch from my home screen even in a dead zone, so that my watchlist and last results are still there.

**Acceptance criteria**

- [ ] A web manifest with icons and theme colors makes the app installable; a custom, user-triggered install prompt replaces any browser-default nag.
- [ ] The service worker precaches the app shell; a cold offline launch renders the shell with a connectivity notice instead of the browser dinosaur.
- [ ] Poster images cache first with a bounded strategy (no more than 200 entries) so browsing history stays offline without unbounded storage.
- [ ] Cache-first strategy never serves stale result pages older than the query stale window; updates prompt the user to refresh rather than silently swapping.
- [ ] The watchlist page is fully functional offline (F2 guarantees no API dependency).

**Technical notes.** `vite-plugin-pwa` with Workbox runtime caching. Restrict precache to the shell and route assets; never precache API responses — the query cache owns data freshness.

### 5.8 F8 — TMDB Provider Migration

OMDb is a ratings aggregator with a search endpoint; TMDB is a full catalogue with trending lists, genre discovery, person pages, cast and crew, embeddable trailers, backdrops and an image CDN serving sized variants. Migrating content depth to TMDB — behind the adapter of Section 6.2, with OMDb retained for its aggregated ratings — is the largest single unlock in this specification. It converts the product from a lookup tool into a discovery destination, and it removes the 1,000-per-day quota as the ceiling on growth.

> **User story:** As an undecided viewer, I want to browse what is trending, follow a favorite director to their filmography, and watch a trailer before choosing, so that the app helps me decide rather than merely confirm.

**Acceptance criteria**

- [ ] A provider adapter interface (search, details, image) has two implementations — `omdb` and `tmdb` — selected by a client feature flag defaulting to `omdb`, deployable dark and flipped per environment.
- [ ] Under the `tmdb` provider, the home page gains trending and genre-browse sections, and the details page renders a backdrop hero, full cast with person links, and an embeddable trailer.
- [ ] Posters and backdrops load from the TMDB image CDN at sized variants (thumbnail in grids, larger on details), replacing full-resolution images — a direct Core Web Vitals win.
- [ ] Ratings blocks still render IMDb, Metacritic and Rotten Tomatoes values by OMDb lookup keyed on IMDb ID, with graceful omission when OMDb is unavailable or exhausted.
- [ ] UI components consume only normalized models; no component branches on provider identity.
- [ ] The Netlify function (or a sibling) proxies TMDB with its own server-side key and the same typed error taxonomy; attribution requirements in TMDB's terms are satisfied visibly in the footer.

**Technical notes.** TMDB keys movies by internal ID but exposes IMDb IDs via an external-ID lookup; the adapter maps through it to keep IMDb IDs as the application's stable identifier. This is the only feature gated on acquiring a second (free) API key.

---

## 6. Target Architecture and Data Design

### 6.1 Module Structure

The codebase already separates pages, layout components, UI components and API calls. The target keeps that shape and adds the three layers the feature set requires: hooks (stateful behavior), a query layer (cache and transport), and a provider adapter (data normalization).

**Table 5 — Target source layout and responsibilities**

| Module | Responsibility |
|---|---|
| `src/api/` | Provider adapters (`omdbAdapter`, `tmdbAdapter`) behind one interface; typed error mapping; no React imports |
| `src/lib/` | Query client and configuration; SEO/head utilities; misc helpers (formatting, guards) |
| `src/hooks/` | `useMovieSearch` (infinite query wrapper), `useDebounce`, `useLocalStorage`, `useTheme`, `useScrollRestoration` |
| `src/context/` | `WatchlistProvider` and `ThemeProvider` — the only two global consumers |
| `src/components/ui/` | Presentational atoms: `MovieCard`, `RatingRow`, `Skeleton`, `ErrorState`, `EmptyState`, `ThemeToggle` |
| `src/components/layout/` | `Navbar`, `Footer`, `AppLayout` (unchanged responsibilities, error boundary added) |
| `src/components/features/` | Composites: `SearchBar` with suggestions, `ResultGrid`, `WatchlistButton`, `ShareRow` |
| `src/pages/` | Route components kept thin — orchestration only, no fetching logic inline |
| `netlify/functions/` | `omdb-proxy` (existing, env-renamed) and `tmdb-proxy` (new); shared validation and error shaping |
| `public/` | Favicon set, PWA icons and manifest (replacing the `/src/assets` icon reference) |

### 6.2 Data Models and the Adapter Contract

All UI consumes normalized shapes, never provider payloads. Search requests are a `SearchParams` tuple (term, year, type, page); responses are a `PagedResults` object (items, totalResults, page, hasMore) whose items are `MovieSummary` records with `imdbID` as the stable identifier, plus title, year, type and poster URL (already resolved through the provider's image strategy, or a placeholder URL when absent). Details normalize to a `MovieDetails` record covering title, year, rated, runtime, genres, plot, credits (director, writers, actors), ratings array (source and value pairs), box office, awards, language, country and — when the provider is TMDB — backdrop, cast list with person IDs and trailer key. Watchlist entries are `MovieSummary` plus a timestamp.

The adapter contract is deliberately three methods — `search`, `details` and `image` — so a provider swap touches exactly one directory. Errors normalize to a typed `ApiError` with a kind of `quota`, `network`, `not-found` or `upstream`, produced at the proxy boundary where HTTP status is still meaningful, and carried through the query layer to a single `ErrorState` component. This taxonomy is what makes quota exhaustion honest (F4) and providers swappable (F8).

### 6.3 Environment, Configuration and Developer Workflow

Secrets move to un-prefixed server-side names; client flags take the `VITE_` prefix consciously. An `.env.example` file documents every variable and the README quickstart is corrected to `netlify dev`, closing CS-02 at the documentation layer as well as the code layer.

**Table 6 — Environment variables (target state)**

| Variable | Scope | Purpose |
|---|---|---|
| `OMDB_API_KEY` | Server only | OMDb proxy key; un-prefixed so Vite can never inline it (resolves CS-09) |
| `TMDB_API_KEY` | Server only | TMDB proxy key; optional — absent key disables the tmdb provider flag |
| `ALLOWED_ORIGINS` | Server only | Comma-separated CORS allowlist including localhost and deploy previews (resolves CS-10) |
| `VITE_DATA_PROVIDER` | Client | `omdb` (default) or `tmdb`; drives adapter selection behind F8's flag |

`netlify.toml` becomes explicit rather than auto-detected: build command, publish directory, the functions directory, an SPA fallback redirect of all paths to `index.html` with status 200 (CS-08), immutable cache headers for hashed assets, and baseline security headers (X-Content-Type-Options, X-Frame-Options deny, a referrer policy, and a content security policy permitting self plus the poster image hosts). The Dockerfile is rebuilt as a multi-stage production image — install, build, then a minimal static-serve runtime as a non-root user — and one lockfile survives (bun, given `bun.lock` is committed; CS-11 and CS-12).

---

## 7. Implementation Roadmap: Four Phases

The sequence is deliberately dependency-shaped: stabilize, then build the data foundation, then ship user-visible value, then swap the data source behind the interface those features already target. Durations assume one maintainer working part-time; they are planning estimates, not commitments. Each phase ends with exit criteria that are binary — a phase is done when its criteria pass, not when its tasks are merely attempted.

**Table 7 — Roadmap phases, scope and exit criteria**

| Phase | Duration | Scope | Exit criteria |
|---|---|---|---|
| 0 — Stabilize | 1 week | All five P1s (CS-01, 02, 03, 04, 06); metadata, LICENSE, .env.example; SPA redirect; dead code and dependency removal (CS-07, 13, 19, 20, 21, 22) | Zero crashes on invalid IDs, failed proxy and quota states; fresh clone to first successful search in under five minutes, documented |
| 1 — Foundations | 2 weeks | F1 URL search; F4 query layer; error boundaries and skeletons; lazy routes and images; asset compression; a11y pass; per-page titles (CS-14 through 18) | Lighthouse performance and accessibility of 90 or higher on search and details; repeat navigation makes zero network calls within the stale window |
| 2 — User value | 3 weeks | F2 watchlist; F5 suggestions and recent searches; F6 theme toggle; F3 enriched details and sharing; result count and pagination fallback (CS-23) | All F2, F3, F5, F6 acceptance criteria pass; both themes pass contrast AA; watchlist renders offline |
| 3 — Scale and data | 4–6 weeks | F8 TMDB adapter dark; F7 PWA; TypeScript migration begun; Vitest, Playwright and CI pipeline; production Docker; dependency automation | tmdb provider serves all surfaces behind the flag with no component changes; CI green in under ten minutes; installable PWA passes offline criteria |

Phase 0 deserves emphasis because it is small and pays twice: the loader guard, poster placeholder, error-state component and observer fix are each under a day, and together they convert the application from crash-prone to trustworthy before any new surface ships. Phase 1 is the only phase with invisible-to-user infrastructure (the query layer) and it is placed immediately after stabilization so that every subsequent feature inherits caching, retries and honest errors for free. Phase 3 intentionally overlaps the TMDB migration with the test build-out: the adapter boundary is exactly where a characterization test suite pays off, locking OMDb behavior in tests before TMDB replaces it at runtime.

---

## 8. Testing, Quality Assurance and CI/CD

The project currently has zero automated tests, which is viable at three commits and untenable at the end of this roadmap. The strategy favors few, high-leverage tests over blanket coverage: unit tests on pure logic, component tests on the states users can reach, and end-to-end tests on the three flows that define the product.

**Unit and component testing.** Vitest with React Testing Library covers the pure seams: year validation logic, the `useLocalStorage` and `useDebounce` hooks, adapter normalization (provider payloads in, normalized models out, N/A suppression included) and the typed error mapper. Component tests exercise the states users can reach: `MovieCard` renders the placeholder when the poster is N/A, `ErrorState` distinguishes quota from not-found, the `SearchBar` dropdown responds to keyboard input, and the `WatchlistButton` toggles and persists. Mock Service Worker intercepts the `/.netlify/functions` path so component tests never touch the network or burn quota.

**End-to-end testing.** Playwright drives three journeys: search, scroll several pages, open details, navigate back and confirm state and scroll survived; add to watchlist, reload, confirm persistence and removal; and deep-link a details URL cold and confirm a rendered page (guarding the SPA redirect of CS-08 forever). Offline behavior joins the suite when F7 lands.

**Continuous integration.** A GitHub Actions workflow runs on every pull request: install from the single lockfile, lint, run unit and component tests, build, and upload the bundle with a size budget check (250 KB compressed initial JavaScript). Netlify deploy previews follow automatically. Lighthouse CI asserts budgets — performance 90, accessibility 95, initial JavaScript 250 KB — on the built preview. Dependency automation (Renovate or Dependabot) opens grouped minor updates monthly, keeping the diff-reviewable cadence compatible with a solo maintainer, while majors route through the flag and test harness.

---

## 9. Risks and Mitigations

**Table 8** registers the material risks to this plan with likelihood, impact and the mitigation already embedded in the design. The two that matter most are quota exhaustion (which this plan attacks from three directions at once) and maintainer bandwidth (which the phase gates are designed to protect).

**Table 8 — Risk register**

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| OMDb daily quota exhausted at peak | High | High | Query cache with de-duplication and persistence (F4); proxy maps limits to HTTP 429; TMDB migration removes the ceiling (F8) |
| TMDB key, terms or attribution change | Low | Medium | Provider isolated behind the adapter; OMDb remains a complete fallback; feature flag flips back in one config change |
| Netlify function cold starts or limits | Low | Medium | Functions stay trivial and cache-friendly; edge functions are a drop-in escalation path if latency ever matters |
| Solo-maintainer scope creep | Medium | High | Phase exit criteria are binary; features are sliced to ship independently; non-goals (Section 4) are contractual |
| Framework or major-dependency breakage | Medium | Medium | Pinned lockfile, dependency automation with grouped minors, majors behind flags and the new test harness |
| Migration regressions on provider swap | Medium | High | Adapter characterization tests lock OMDb behavior first; TMDB ships dark behind the flag with e2e parity checks before default flip |

---

## 10. Success Metrics and Measurement Plan

The application has no instrumentation today, so baselines below are review estimates rather than measurements; Phase 1 introduces the counters that make the targets falsifiable. Metrics are chosen to be observable from the client or free tooling — no analytics service is required, consistent with the non-goals.

**Table 9 — Success metrics: baseline and target**

| Metric | Baseline (estimated) | Target | Instrument |
|---|---|---|---|
| Crash-free sessions | Unknown; crash paths reproducible | 99.5% or higher | Error boundary reporting hook |
| Largest Contentful Paint, search page | Over 4 s on 4G (1.1 MB hero image) | Under 2.5 s | Lighthouse CI per PR |
| Initial JavaScript, compressed | Single unbundled chunk, est. over 350 KB | 250 KB or less | Bundle budget in CI |
| API requests per repeat session | Every view refetches | −40% | Proxy function request log |
| Lighthouse accessibility | Under 90 (unlabeled controls) | 95 or higher | Lighthouse CI per PR |
| Watchlist adoption (share of sessions) | Feature absent | 10% or more | Client counter event |
| CI pipeline duration | No pipeline | Under 10 minutes | GitHub Actions telemetry |

Two review notes on honesty in measurement: crash-free rate only becomes meaningful once the error boundaries of Phase 1 exist, and the request-reduction target is measurable precisely because the proxy is already a single choke point through which every catalogue call flows. Both instruments are free, private and owned by the project.

---

## Appendix A: Detailed Issue Register (CS-01 to CS-24)

The register below is the complete set of findings from the static review, in severity order. Locations reference files at the reviewed commit. Each entry pairs the observation with the recommended remediation and the roadmap phase in which it lands; items absorbed by a feature reference that feature instead of a phase.

**Table 10 — Complete issue register**

| ID | Sev | Area | Location | Finding | Remediation / lands in |
|---|---|---|---|---|---|
| CS-01 | P1 | Correctness | `src/api/getMovieDetails.js`; `src/pages/MovieDetails.jsx` | Loader catches all errors and returns `undefined`; page dereferences the result and crashes; `Response: False` never checked | Throw a typed error from the loader; render ErrorState; guard provider failure bodies. Phase 0 |
| CS-02 | P1 | Onboarding | `README.md`; `vite.config.js` | Documented `npm run dev` flow cannot reach `/.netlify/functions` proxy; all searches fail locally without `netlify dev` | Document `netlify dev` as the dev command; optionally add a Vite dev middleware for the function. Phase 0 |
| CS-03 | P1 | UI integrity | `src/components/ui/MovieCard.jsx`; `src/pages/MovieDetails.jsx` | OMDb reports missing artwork as literal `N/A`; rendered as `img src` producing broken-image icons | Placeholder artwork component plus onError fallback. Phase 0 |
| CS-04 | P1 | Error handling | `src/pages/Movie.jsx` | Every `Response: False` renders the no-results state, including quota and network failures | Typed error taxonomy with distinct states and retry affordance. F4 |
| CS-06 | P1 | Data loading | `src/pages/Movie.jsx` (observer effect) | Observer re-created across seven dependencies; re-observation refires; no abort; duplicate pages possible | `useInfiniteQuery` with AbortController (F4) and a dedicated hook |
| CS-05 | P2 | State | `src/pages/Movie.jsx` | `sessionStorage.clear()` wipes all origin keys; brittle undefined-string guards on restore | Namespace keys and remove them individually. F1 removes the mirror entirely |
| CS-07 | P2 | Dependencies | `src/components/layout/Navbar.jsx` | Imports framer-motion (a transitive dependency of motion) plus an unused `delay` symbol | Import from `motion/react`; drop unused symbol. Phase 0 |
| CS-08 | P2 | Deployment | `netlify.toml` | No SPA fallback redirect; deep links depend on Netlify auto-detection surviving refresh | Explicit all-paths to `index.html` redirect with status 200. Phase 0 |
| CS-09 | P2 | Security | `netlify/functions/omdb-proxy.js` | Server-only key uses the `VITE_` prefix, which marks client-safe inlining; no `.env.example` committed | Rename to `OMDB_API_KEY`; commit `.env.example`. Phase 0 |
| CS-10 | P2 | Security | `netlify/functions/omdb-proxy.js` | CORS allowlist hardcodes one production origin with a `null` fallback; no localhost or previews | `ALLOWED_ORIGINS` environment list. Phase 0 |
| CS-11 | P2 | Deployment | `Dockerfile` | Container runs the dev server; `npm install` rather than `ci`; runs as root | Multi-stage production build with static-serve runtime and non-root user. Phase 3 |
| CS-12 | P3 | Tooling | Repository root | `bun.lock` and `package-lock.json` both committed; drift risk between them | Choose bun; remove the other lockfile. Phase 0 |
| CS-13 | P3 | Metadata | `package.json` | Name is the template leftover `toggle-switch`; version 0.0.0; no description, license or engines | Correct name, description, MIT license field, engines. Phase 0 |
| CS-14 | P2 | Performance | `src/assets/` | 2.9 MB autoplaying MP4 without poster frame; 1.8 MB and 1.1 MB JPEG backgrounds; one 336 KB image unused | Compress and convert (WebP, sized poster frame); remove the unused asset. Phase 1 |
| CS-15 | P2 | Performance | `src/pages/Movie.jsx` result grid | Poster images load eagerly; no lazy or async decoding attributes | `loading="lazy"` and `decoding="async"` with skeletons. Phase 1 |
| CS-16 | P2 | Performance | `src/App.jsx` | No route-level code splitting; static pages ship in the main chunk with MUI and motion | `React.lazy` with Suspense per route. Phase 1 |
| CS-17 | P2 | Accessibility | `src/pages/Home.jsx`; `src/pages/Movie.jsx` | Anchors without `href` used as buttons (keyboard-unreachable); placeholder-only labels; no reduced-motion handling of the video | Semantic buttons, labeled controls, reduced-motion strategy. F6 and Phase 1 |
| CS-18 | P2 | SEO | `index.html`; all routes | Static title only; no description or Open Graph tags; `document.title` never set per route | Per-route titles and OG tags from the head utility. F3 |
| CS-19 | P3 | Hygiene | `src/pages/MovieDetails.jsx` | `console.log` ships in the production details path | Remove; optional dev-only logger. Phase 0 |
| CS-20 | P3 | Hygiene | `package.json` | axios and styled-components declared but never imported | Remove dead dependencies. Phase 0 |
| CS-21 | P3 | Hygiene | `src/App.css`; `index.html` | Unimported Vite template stylesheet; Google-hosted Inter font loaded but unused (blocking request) | Delete `App.css`; remove the Inter import or standardize on it. Phase 0 |
| CS-22 | P3 | Docs | `README.md` | Links a LICENSE file that does not exist and a `public/screenshots` directory that does not exist | Add the MIT LICENSE; correct or capture the referenced screenshots. Phase 0 |
| CS-23 | P2 | UX | `src/pages/Movie.jsx` | No result count display; no pagination fallback for the infinite scroll; type filter defaults to movie rather than All | Result count, page controls, default All. Phase 2 |
| CS-24 | P3 | Reliability | `src/pages/not-found.scss` | 404 effect hotlinks an external Giphy asset (availability and privacy exposure) | Self-host the asset or replace the effect with CSS. Phase 1 |

Register totals: five P1, twelve P2 and seven P3 findings. Every entry is either closed in Phase 0, absorbed by a feature specification F1 through F8, or scheduled in a later phase as noted; none is left unowned.
