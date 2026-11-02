# DESIGN.md — CineSearch Editorial Design System

## 1. Aesthetic Direction & Point of View
**CineSearch** adopts an **Archival Repertory Cinema** aesthetic inspired by Criterion Collection essays, MUBI Notebook, and classic film festival programs. It rejects generic streaming-template clutter (neon gradients, pill-soup metadata, nested cards-within-cards) in favor of high-contrast editorial serif typography, hairline ledger rules, and warm obsidian/alabaster surfaces.

## 2. Typography (`2+1` Hierarchy)

| Role | Font Family | CSS Variable / Utility | Weight & Tracking | Usage |
|---|---|---|---|---|
| **Display / Film Titles** | `'Fraunces'`, Georgia, serif | `--font-display` / `.font-display` | `600–700`, tracking `-0.025em`, `text-wrap: balance` | Hero headlines, movie dossier titles, card titles, section headers |
| **UI & Editorial Prose** | `'Plus Jakarta Sans'`, sans-serif | `--font-sans` | `400–600`, line-height `1.65`, max-width `65ch`, `text-wrap: pretty` | Navigation, synopses, form controls, buttons, empty/error states |
| **Technical & Numeric** | `'JetBrains Mono'`, monospace | `--font-mono` / `.tabular-nums` | `400–600`, `font-variant-numeric: tabular-nums` | Release years, runtimes, ratings (`9.1/10`, `94%`), result counters, numbered kickers (`01 ·`) |

## 3. Color & Surface Tokens

### Dark Mode (Default — Screening Room Obsidian)
- **Primary Canvas (`--surface-bg`):** `#0c0c0e` (Deep Obsidian Charcoal — never pure `#000000`)
- **Elevated Card / Dossier (`--surface-elevated`):** `#141418` (Warm Slate Surface)
- **Footer / Recessed Well (`--surface-recessed`):** `#08080a`
- **Hairline Border (`--surface-border`):** `rgba(255, 255, 255, 0.08)` (hover: `rgba(255, 255, 255, 0.20)`)
- **Primary Ink:** `#ececef`
- **Secondary Ink:** `#a1a1aa`

### Light Mode (Archival Alabaster Paper)
- **Primary Canvas (`--surface-bg`):** `#f8f7f4` (Warm Alabaster)
- **Elevated Card / Dossier (`--surface-elevated`):** `#ffffff`
- **Footer / Recessed Well (`--surface-recessed`):** `#f0eee9`
- **Hairline Border (`--surface-border`):** `rgba(20, 20, 23, 0.10)` (hover: `rgba(20, 20, 23, 0.22)`)
- **Primary Ink:** `#141417`
- **Secondary Ink:** `#52525b`

### Semantic Accent Palette
- **Primary Brand Accent (`--accent-vermilion`):** `#d93829` (Desaturated Cinema Vermilion; hover `#b82d20`; dark-mode text highlight `#e84a3b`)
- **Critical Consensus Gold (`--accent-gold`):** `#f59e0b` (IMDb star & awards highlight)
- **Metascore Emerald:** `#10b981`

## 4. Layout, Spacing & Component Rules

1. **Zero-Pill Metadata Discipline:**
   - Static metadata (Release Year, Content Type, Runtime, MPAA Rating) must never be wrapped in pill badges. Render them as clean typographic strings separated by middle dots (`2008 · PG-13 · 152 MIN · MOVIE`) in `font-mono tabular-nums`.
   - Interactive filters (Genre filter tabs, Quick Search presets) use crisp rectangular/rounded-lg buttons with explicit `aria-pressed` states.
2. **2:3 Poster Frame Integrity:**
   - All poster cards enforce `aspect-[2/3]` with `object-cover`, `referrerPolicy="no-referrer"`, pulse skeleton placeholders, and a custom typographic "No Artwork" fallback frame when `Poster === "N/A"`.
3. **No Nested Cards-in-Cards:**
   - On `/movies/:movieID`, ratings and production specifications use hairline horizontal/vertical ledger dividers (`border-y`, `<dl>`) rather than boxed sub-cards.
4. **Tactile Micro-Interactions & Motion:**
   - Interactive buttons use `active:scale-[0.98]` and `transition-all duration-200`.
   - Poster cards elevate subtly (`hover:-translate-y-1`) with a `500ms` image scale (`group-hover:scale-[1.03]`).
   - All animations and autoplaying hero media strictly respect `@media (prefers-reduced-motion: reduce)`.
