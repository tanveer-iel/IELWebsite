# IEL Website

Corporate website of **Integrated Equities Limited (IEL)** — https://iel.net.pk

## Branches
- `main` — stable production base (plain HTML, tagged `v1.0.0`).
- `IELAstro` — the site migrated to [Astro](https://astro.build) (all 21 pages).

## Project structure (IELAstro)
```
src/pages/        one .astro file per page (About.astro -> /About.html)
src/layouts/      Layout.astro (html/head/body shell)
src/components/   Nav.astro, Footer.astro (shared)
public/           static files served as-is: images, fonts, style.css, JS, Supabase scripts
scripts/          local-build.sh
astro.config.mjs  static output, build.format = "file" (URLs unchanged)
vercel.json       security headers
```
Dynamic content (blogs, news, research, financial statements) is loaded from Supabase by the scripts in `public/`.

## Build
`node_modules` cannot be installed inside the Google Drive folder. Build from a local mirror:

```bash
bash scripts/local-build.sh          # build  -> C:/dev/iel-build/dist
bash scripts/local-build.sh preview  # serve the built site
```
On a normal (non-Drive) checkout you can simply use `npm ci && npm run build`. Vercel builds directly from the repo.

## Releases
See the [Releases page](https://github.com/tanveer-iel/IELWebsite/releases) and [CHANGELOG.md](CHANGELOG.md).

## Project notes
Decisions, history and next steps are tracked in [MEMORY.md](MEMORY.md).

_Last updated: 2026-10-07_
