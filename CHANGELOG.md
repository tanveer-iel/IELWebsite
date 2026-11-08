# Changelog

## v2.5.0 — 2026-11-08

- Financial Statements page: every tab (Audited, Half Yearly, Quarter Ended 30 Sept / 31 March, LCB) is now grouped by financial year (Jul-Jun, e.g. "FY 2026-27"), newest first, in collapsible cards with a Description | PDF table and a search box.
- LCB sections were previously grouped by calendar year; they now follow the July-June financial year.
- Upload timestamp prefixes (e.g. `1794077905723-`) are hidden from visitors in displayed filenames and search.
- Cache-busting tag for `supabaseFinancialStatements.js` bumped to `?v=5`.
- `Guides/` added to `.gitignore`.

## v1.0.0 — 2026-10-06

Base build as handed over by Anwar Farid sb on October 06, 2026.

## Unreleased — IELAstro branch

- Migrated all 21 pages from static HTML to Astro (same URLs, same content).
- Shared `Nav` and `Footer` components; static assets moved to `public/`.
- Added `scripts/local-build.sh` for building outside Google Drive.
