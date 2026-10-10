# IEL Website — Developer's Guide to the Astro Templates

How the `IELAstro` branch is put together, and how to create, edit and use pages, layouts and components.

> This folder (`Guides/`) is documentation only. It is listed in `.vercelignore`, so it is never uploaded to or deployed on Vercel.

---

## 1. Mental model

Astro turns every file in `src/pages/` into one HTML file at build time. There is no server and no client framework. The output is plain static HTML plus the files in `public/`.

```
src/pages/About.astro  ──build──►  dist/About.html
src/layouts/Layout.astro  (html / head / body shell)
src/components/Nav.astro, Footer.astro  (shared pieces)
public/  ──copied as-is──►  dist/   (images, fonts, style.css, JS)
```

Key config ([astro.config.mjs](../astro.config.mjs)):
- `output: "static"` — pure static site.
- `build.format: "file"` — `About.astro` becomes `About.html` (not `About/index.html`), so every existing URL, canonical link and search-engine entry is unchanged.

## 2. Project layout

| Path | Purpose |
|---|---|
| `src/pages/*.astro` | One file per page (21). File name = URL: `Contact.astro` → `/Contact.html`, `index.astro` → `/index.html` |
| `src/layouts/Layout.astro` | The `<html>`, `<head>`, `<body>` shell used by every page |
| `src/components/Nav.astro` | Shared top navigation (desktop dropdowns + mobile menu) |
| `src/components/Footer.astro` | Shared footer |
| `public/` | Served untouched: `Assets/`, `IEL Assets/`, `fonts/`, `style.css`, `home.js`, `index.js`, `supabase*.js` |
| `scripts/local-build.sh` | Builds from a local mirror (see §8) |
| `vercel.json` | Security headers |
| `.vercelignore` | Files kept out of Vercel uploads (includes `Guides/`) |

## 3. The Layout

[src/layouts/Layout.astro](../src/layouts/Layout.astro):

```astro
---
const { bodyAttrs = {}, htmlLang = "en" } = Astro.props;
---
<!doctype html>
<html lang={htmlLang}>
  <head><slot name="head" /></head>
  <body {...bodyAttrs}><slot /></body>
</html>
```

- **`head` slot** — everything that goes inside `<head>` (title, meta, CSS links, Tailwind CDN script, page `<style>`).
- **default slot** — the page body.
- **Props** (both optional): `htmlLang` (default `"en"`), `bodyAttrs` (object spread onto `<body>`, e.g. `{ class: "bg-white" }`).

## 4. Anatomy of a page

Every page follows this shape (see [Privacy.astro](../src/pages/Privacy.astro) for a clean example):

```astro
---
import Layout from "../layouts/Layout.astro";
import Nav from "../components/Nav.astro";
import Footer from "../components/Footer.astro";
---
<Layout>
  <Fragment slot="head">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>IEL | Page Title</title>
    <meta name="description" content="..." />
    <meta property="og:url" content="https://iel.net.pk/PageName.html" />
    <link rel="canonical" href="https://iel.net.pk/PageName.html" />
    <link rel="stylesheet" href="style.css" />
    <script is:inline src="https://cdn.tailwindcss.com"></script>
    <style is:inline> /* page-specific CSS */ </style>
  </Fragment>

  <main class="h-[80px] xl:h-[110px]">
    <Nav />
  </main>

  <!-- page content: plain HTML + Tailwind classes -->

  <Footer extra="mt-[80px]" />

  <script is:inline src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
  <script is:inline src="index.js"></script>
</Layout>
```

Rules:
1. The `---` fence (frontmatter) holds imports and any JavaScript that runs **at build time**. It never reaches the browser.
2. Head content must be wrapped in `<Fragment slot="head"> … </Fragment>`.
3. Markup below the fence is ordinary HTML with Tailwind utility classes.

## 5. Components

### Nav — `<Nav />`
Optional prop `navClass` (see the note below). Contains the logo, the "What we offer" and "Investors information" dropdowns, the top-level links and the mobile menu (`#menu-toggle` / `#mobile-menu`, wired up by page JS such as `public/index.js`). **Edit [Nav.astro](../src/components/Nav.astro) once and every page updates.**

To add a menu link, copy an existing `<a href="X.html" class="...">` in both the desktop section and the mobile section.

### Footer — `<Footer extra="..." padTop="..." />`
Optional props `extra` and `padTop` (see the note below). Edit [Footer.astro](../src/components/Footer.astro) to change link lists, addresses, social icons etc. everywhere.

> **Single source of truth:** all 21 pages, including `index.astro`, use `Nav.astro` and `Footer.astro`. Their content was taken from the home page (`index.html` on `main`), which is the standard. Never paste a copy of the header or footer into a page.
>
> Per-page *layout* differences are props, not copies:
> - `<Nav navClass="..." />` — classes on the `<nav>` tag (default `top-0 left-0 w-full z-50`; the home page passes its own taller white bar).
> - `<Footer extra="..." padTop="..." />` — `extra` = outer classes (default `mt-[80px]`), `padTop` = top padding of the link grid (default `pt-[60px] md:pt-[100px]`; the home page uses `pt-[140px] md:pt-[206px]`).

### Creating a new component
1. Create `src/components/MyThing.astro`.
2. Declare props in the frontmatter, then write markup:
   ```astro
   ---
   const { title, href = "#" } = Astro.props;
   ---
   <a class="block p-4 rounded-lg bg-black text-white" href={href}>{title}</a>
   ```
3. Use it in a page:
   ```astro
   import MyThing from "../components/MyThing.astro";
   ...
   <MyThing title="Open an account" href="OpenAccount.html" />
   ```
Props are passed as attributes; use `{expression}` for values. A `<slot />` inside a component renders whatever is placed between its tags.

## 6. Creating a new page

1. Copy a simple page, e.g. `src/pages/Privacy.astro` → `src/pages/MyPage.astro`.
2. Update in the head: `<title>`, `description`, `og:*` tags, `og:url` and `canonical` (`https://iel.net.pk/MyPage.html`).
3. Replace the body content between `<Nav />` and `<Footer />`.
4. If the page needs behaviour, add scripts at the end (see §7).
5. Link to it from `Nav.astro`/`Footer.astro` as `href="MyPage.html"`.
6. Build and open `/MyPage.html`.

## 7. Conventions and gotchas

- **Keep `is:inline` on every `<script>` and `<style>`.** Without it Astro bundles/rewrites them (changing order, scoping CSS). With `is:inline` they ship exactly as written. This was deliberate for the migration.
- **Asset paths are relative** (`src="IEL Assets/..."`, `href="style.css"`). They resolve because all pages sit at the site root. Do not put pages in sub-folders without switching to root-absolute paths (`/IEL Assets/...`).
- **Static files go in `public/`**, never `src/`. A file at `public/Assets/x.svg` is referenced as `Assets/x.svg`.
- **Tailwind comes from the CDN script** in each page head — there is no Tailwind build or config. Arbitrary values like `h-[80px]` work as usual.
- **Dynamic content** (news, blogs, research, financial statements) is fetched client-side from Supabase by `public/supabase*.js`. The Astro templates only provide the empty containers and the `<script>` tags. The anon key in `supabase.js` is public by design; Supabase row-level security protects the data.
- **Astro vs HTML pitfalls**: `{` and `}` inside the markup are Astro expressions — in text/JSON snippets use `{"{"}` or put them in an `is:inline` script. `class` works as in HTML. Ampersands in titles are written `&amp;`.
- **Don't edit `dist/`** — it is generated.

## 8. Running and building

`node_modules` cannot be installed on Google Drive (EBADF errors). Use the local mirror:

```bash
bash scripts/local-build.sh            # build  -> C:/dev/iel-build/dist
bash scripts/local-build.sh preview    # serve the built site
```
On a normal checkout (outside Drive): `npm ci`, then `npm run dev` (live reload at http://localhost:4321), `npm run build`, `npm run preview`.

Quick checks after a change: build succeeds, the page opens at `/<Name>.html`, nav/footer render, images and Supabase-loaded sections appear.

## 9. Deployment (Vercel)

- Vercel builds from the repo: `npm run build`, output `dist/`.
- Security headers are in [vercel.json](../vercel.json).
- [.vercelignore](../.vercelignore) excludes `Guides/` (and other non-site files) from what the CLI uploads. For Git-based deployments Vercel only runs the build, and `Guides/` is outside `src/` and `public/`, so it never appears in `dist/` — the site cannot serve these docs.
- Workflow: branch → push → check the Vercel preview URL → merge to `main`.

## 10. Housekeeping

When you change structure, decisions or status, update `MEMORY.md` (log) and `README.md`, and commit them with the change.
