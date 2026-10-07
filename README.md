# IEL Website

Corporate website of **Integrated Equities Limited (IEL)** — https://iel.net.pk

## Current state
- Static HTML pages (`index.html`, `About.html`, `Research.html`, `OpenAccount.html`, …) with vanilla JS and `style.css`.
- Dynamic content (blogs, news, research, financial statements) loaded from Supabase via the `supabase*.js` scripts.
- Deployed on Vercel from this repo; security headers are set in `vercel.json`.

## Branches
- `main` — stable production base (tagged `v1.0.0`).
- `IELAstro` — in-progress work on an Astro-based version of the site.

## Releases
See the [Releases page](https://github.com/tanveer-iel/IELWebsite/releases) and [CHANGELOG.md](CHANGELOG.md).

- **v1.0.0** — Base build as handed over by Anwar Farid sb on October 06, 2026.

## Project notes
Ongoing decisions, history and open questions are tracked in [MEMORY.md](MEMORY.md).

_Last updated: 2026-10-07_
