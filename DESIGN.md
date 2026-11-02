# CineSearch — Art Direction & Design System (`DESIGN.md`)

## 1. Art Direction Summary (`tasteskill v2` & `frontend-design`)

- **Direction & Idea Sentence:**
  - **Direction:** *Archival Projection Ledger & Split Repertory Stage*
  - **The Idea:** On this page, **the projection-booth critical consensus sheet (weighing IMDb audience scores against Rotten Tomatoes and Metacritic critic scores across archival prints)** becomes **an interactive Repertory Consensus Comparator & Projection Desk**.
  - **One Live Thing:** The **Interactive Repertory Consensus Comparator** (`data-ui="consensus-comparator"`, powered by `src/lib/consensus.js`), where visitors select landmark prints (`The Dark Knight`, `Oppenheimer`, `Parasite`, `Dune: Part Two`, `Alien`), scrub the **Audience vs. Critics Weighting Slider** (`0%` to `100%`), inspect real-time weighted consensus scores and critic-audience divergence spreads, switch live between `OMDb` and `TMDB` catalogue adapters, and save prints directly to their local Watchlist.
- **House Rules Enforced (`tasteskill v2`):**
  - **Two-Line Headline Ceiling:** Every `h1`–`h6` fits in two lines or fewer at `1440px`, `768px`, and `390px`.
  - **Two Typefaces Total:**
    - **Display Serif (`--font-display`):** `'Fraunces', Georgia, serif`
    - **Body & Tabular Figures (`--font-sans`):** `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif` with `font-variant-numeric: tabular-nums` on all numeric columns and scores. Zero monospace outside `<code>`/`<pre>`/`<kbd>`.
  - **Tone-Stepped Flat Surfaces:** Surfaces separate by flat tone steps (`#f5f2eb` / `#ebe6dc` / `#e2dcd0` in Archival Paper mode; `#0c0c0e` / `#151519` / `#1d1d23` in Projection Dark mode) with square corners, zero eyebrows above headings, zero index numbering (`01/02/03`), zero gradients, zero glass blur bars, and zero resting drop shadows.
  - **Equal Frame & Full Sections:** Consistent `max-w-[1360px] mx-auto px-5 sm:px-8` outer frame across all routes; every section uses the full 12-column width so no heading or text block sits huddled on one side with an empty half-screen.
  - **Unobstructed Typography:** Nothing ever lies on top of or behind a headline or statement.
