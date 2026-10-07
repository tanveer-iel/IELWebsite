# MEMORY — IEL Website Project Log

Living project memory. Updated as work progresses, together with [README.md](README.md).
Newest entries go at the top of each section.

## Project snapshot
- **Site:** Integrated Equities Limited (IEL) corporate website — https://iel.net.pk
- **Stack (current):** static HTML pages + vanilla JS (`home.js`, `index.js`, `supabase*.js`) + `style.css`; data from Supabase.
- **Hosting:** Vercel, deployed from GitHub. Security headers live in `vercel.json`.
- **Repo:** https://github.com/tanveer-iel/IELWebsite
- **Owner / maintainer:** Tanveer (tanveer@iel.net.pk)
- **Origin:** copied from UsamaAshraf1/IEL; base build handed over by Anwar Farid sb on 2026-10-06.

## Branches
| Branch | Purpose | Status |
|---|---|---|
| `main` | Production base build (`v1.0.0`) | Pushed |
| `IELAstro` | Work on the Astro-based version of the site | Created 2026-10-07, local only (not yet pushed) |

## Releases / tags
- `v1.0.0` — Base build as handed over by Anwar Farid sb on October 06, 2026. GitHub Release with `IELWebsite-v1.0.0.zip` (~200 MB): https://github.com/tanveer-iel/IELWebsite/releases/tag/v1.0.0

## Decisions
- 2026-10-07: New branch `IELAstro` for the Astro work; `main` stays as the stable base. Scope of the Astro work (full migration vs scaffold) not yet decided.
- 2026-10-07: Keep this file and README.md updated at each meaningful step of the project.

## Log
- 2026-10-07: Created `IELAstro` branch from `main`. Created this MEMORY.md and rewrote README.md.
- 2026-10-07: Created GitHub Release `v1.0.0` with downloadable ZIP (GitHub CLI not installed; used GitHub API with saved git credentials).
- 2026-10-07: Added CHANGELOG.md, committed, tagged `v1.0.0`, pushed `main` and tag.

## Notes / gotchas
- Static site has no build step; the "build" is the file tree as-is.
- `gh` CLI is not installed on this machine. Large uploads via curl may report a connection reset even when the upload succeeded — verify via the API.
- Repo is large (~200 MB zipped), mostly `Assets/`, `IEL Assets/` and `fonts/`.

## Open questions
- Astro scope: full migration vs scaffold alongside the current site?
- Push `IELAstro` to GitHub now or after the first commit?
