# MEMORY — IEL Website Project Log

Living project memory. Updated as work progresses, together with [README.md](README.md).

## Project snapshot
- **Site:** Integrated Equities Limited (IEL) corporate website — https://iel.net.pk
- **Stack (`main`, v1.0.0):** static HTML + vanilla JS + `style.css`, data from Supabase.
- **Stack (`IELAstro`):** Astro 7 static site (21 pages), Tailwind via CDN script (unchanged), same vanilla JS in `public/`.
- **Hosting:** Vercel, deployed from GitHub. Security headers live in `vercel.json`.
- **Repo:** https://github.com/tanveer-iel/IELWebsite
- **Owner / maintainer:** Tanveer (tanveer@iel.net.pk)
- **Origin:** copied from UsamaAshraf1/IEL; base build handed over by Anwar Farid sb on 2026-10-06.

## Branches
| Branch | Purpose | Status |
|---|---|---|
| `main` | Production base build (`v1.0.0`, plain HTML) | Pushed |
| `IELAstro` | Astro version of the site | Pushed; all pages migrated (see Log) |

## Releases / tags
- `v1.0.0` — Base build as handed over by Anwar Farid sb on October 06, 2026. GitHub Release with `IELWebsite-v1.0.0.zip`: https://github.com/tanveer-iel/IELWebsite/releases/tag/v1.0.0

## Astro layout (IELAstro)
- `src/pages/*.astro` — one per old `.html` page (21). `build.format: "file"` keeps URLs identical (`/About.html`, `/index.html`).
- `src/layouts/Layout.astro` — `<html>`/`<head>` (via `head` slot)/`<body>`.
- `src/components/Nav.astro`, `Footer.astro` — shared nav/footer (content from home page). Nav takes `navClass`; Footer takes `extra` and `padTop`.
- `public/` — everything served as-is: `Assets/`, `IEL Assets/`, `fonts/`, `style.css`, `home.js`, `index.js`, `supabase*.js`, Google verification file.
- All `<script>`/`<style>` in pages are `is:inline` so they ship exactly as written.
- All pages incl. `index.astro` use the shared Nav/Footer; the home page's header/footer (from `main` index.html) is the standard. Never inline a copy.

## Docs
- `Guides/DEVELOPERS_GUIDE.md` — how the Astro templates work and how to create/edit pages and components. `Guides/` is in `.vercelignore` (not deployed).
- `Guides/HOW_TO_CHANGE_HEADER_FOOTER.md` — how to edit the single-source header/footer, props, dropdown wrapping fix.

## Build workflow (IMPORTANT)
- `node_modules` **cannot** live on Google Drive (npm EBADF errors, junctions unsupported, sync noise).
- Use `bash scripts/local-build.sh [build|preview]` — copies `src/`, `public/`, config to `C:/dev/iel-build`, installs there, builds. Output is in `C:/dev/iel-build/dist`.
- Vercel builds from the repo itself (`npm run build` → `dist/`), so no action needed there.

## Decisions
- 2026-10-07: Full migration of all pages to Astro, preserving markup verbatim for zero visual change; Tailwind stays on the CDN script for now.
- 2026-10-07: Shared Nav/Footer unified from Terms.html. Old per-page variations were only `alt` text casing/typos and a commented-out block; no content differences.
- 2026-10-07: Keep this file and README.md updated at each meaningful step.

## Log
- 2026-10-10: **Header/footer now single-source.** `index.astro` uses shared `Nav`/`Footer` (was inline copies). Content standardised on `index.html` from `main` (user rule: home header/footer is the standard). Layout differences are props: `Nav navClass`, `Footer extra` + `padTop`. 21 pages build; home keeps its own spacing. Side effect: shared nav alts are now the home ones (e.g. "Change Agency Logo" — template leftover, worth renaming).
- 2026-10-10: Reviewed codebase; added `Guides/DEVELOPERS_GUIDE.md` and `.vercelignore` (excludes Guides/, docs, scripts from Vercel uploads). Noted: relative asset paths require all pages at site root; `index.astro` keeps its own nav/footer.
- 2026-10-07: **Migrated all 21 pages to Astro** on `IELAstro`. Built 21 pages; checked against originals (text, img/a/script/style/div counts, img src, a href, script src) — identical. Preview served pages and assets with HTTP 200.
- 2026-10-07: Pushed MEMORY.md + README.md commits to `origin/IELAstro`.
- 2026-10-07: Created `IELAstro` branch from `main`; created MEMORY.md; rewrote README.md.
- 2026-10-07: Created GitHub Release `v1.0.0` with downloadable ZIP (GitHub CLI not installed; used GitHub API with saved git credentials).
- 2026-10-07: Added CHANGELOG.md, committed, tagged `v1.0.0`, pushed `main` and tag.

## Notes / gotchas
- `gh` CLI is not installed. Large curl uploads may report a connection reset even if they succeeded — verify via the API.
- Supabase anon key is hard-coded in `public/supabase.js` (anon keys are public by design; row-level security is what protects the data).
- Not yet visually compared in a real browser (browser MCP was unavailable) — do a manual pass before merging.

## Open questions / next steps
- Visual check in a browser of key pages (home, About, Research, News, Contact, OpenAccount).
- Check the Vercel preview deployment of `IELAstro` before merging into `main`.
- Optional follow-ups: replace Tailwind CDN with a compiled Tailwind build; move inline page scripts and Supabase scripts into bundled modules; unify home nav with the shared Nav; optimise the large images (e.g. Big_News.png is 1.6 MB).
