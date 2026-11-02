# PRODUCT.md — CineSearch

## 1. Product Identity & Purpose
**CineSearch** is an editorial film and television discovery index and personal repertory companion. It enables cinema enthusiasts to search across dual catalogue providers (**OMDb** and **TMDB**), compare critical consensus from **IMDb**, **Rotten Tomatoes**, and **Metacritic** side by side, and curate an offline-ready, local-first **Watchlist** without accounts or telemetry.

## 2. Target Audience & Core Jobs-to-be-Done
- **Discerning Viewers & Film Enthusiasts:** Want to evaluate whether a film or series is worth watching tonight by comparing audience scores against critical consensus in a single view.
- **Archival Explorers:** Search by title, director, release year (`1880–present`), or content type (`movie`, `series`, `episode`) with shareable, URL-synchronized query state.
- **Privacy-First Curators:** Maintain a persistent personal Watchlist in browser storage with one-click JSON export/import and Progressive Web App (PWA) offline access.

## 3. Surface Modes (Impeccable Mode Mapping)

| Route / Surface | Primary Mode | Secondary Mode | Success Criteria for the Visitor |
|---|---|---|---|
| `/` (`Home.jsx`) | **Persuade** | **Experience** | Atmospheric cinema hero establishes editorial authority; visitor launches into the catalogue or explores trending repertory by genre. |
| `/movies` (`Movie.jsx`, `SearchBar.jsx`, `ResultGrid.jsx`) | **Operate** | **Read** | Fast, frictionless search with `/` keyboard focus, debounced combobox suggestions, release-year validation, and tabular result scanning. |
| `/movies/:movieID` (`MovieDetails.jsx`) | **Read** | **Operate** | Deep film dossier structured for effortless reading: multi-source ratings ledger, `65ch` synopsis, interactive director/cast credits, and one-click Watchlist/share actions. |
| `/watchlist` (`Watchlist.jsx`) | **Operate** | — | Zero-latency local collection management with type filtering, multi-key sorting, undoable removal toasts, and portable JSON backup. |
| `/about` (`About.jsx`) | **Read** | **Persuade** | Clear editorial manifesto organized into numbered architectural pillars (`01`–`03`) with `65ch` measure. |
| `/contact` (`Contact.jsx`) | **Operate** | **Read** | Direct creator dossier paired with a client-side validated dispatch form. |

## 4. Non-Negotiable Product Constraints
1. **Zero Server-Side Key Exposure:** API keys live exclusively in serverless proxies (`/api/omdb`, `/api/tmdb`); fallback catalogue data guarantees resilience when keys are unconfigured or rate-limited.
2. **Honest Error & Empty States:** Distinguish HTTP 429 quota limits, network drops, and 404 titles with actionable recovery paths.
3. **Zero Telemetry:** All user preferences (`cinesearch:theme`, `cinesearch:provider`, `cinesearch:watchlist`, `cinesearch:recent-searches`) remain strictly local.
