# How to Change the Header / Footer

The header (navigation) and footer exist in **one place each**. Edit that file once and all 21 pages update, including the home page.

| What | File |
|---|---|
| Header / navigation | [src/components/Nav.astro](../src/components/Nav.astro) |
| Footer | [src/components/Footer.astro](../src/components/Footer.astro) |

> Rule: never paste a copy of the header or footer into a page. If a page needs to look different, use a prop (see §4).
> The standard content is the home page's header/footer (as on `main` `index.html`).

---

## 1. Workflow

1. Edit `Nav.astro` or `Footer.astro`.
2. Preview: `bash scripts/local-build.sh preview` (or `npm run dev` on a checkout outside Google Drive).
3. Check the home page **and** one inner page (e.g. `About.html`), on desktop and mobile width.
4. Update `MEMORY.md` (log) and commit.

## 2. Header (Nav.astro)

The file has two parts. Change **both** when adding or renaming a link:

- **Desktop** (`hidden xl:flex ...`): the "What we offer" and "Investors information" dropdowns plus the top-level links.
- **Mobile** (`#mobile-menu`): the hamburger menu list, further down the same file.

### Add / rename / remove a menu link
Copy an existing link and edit `href` and the text:
```html
<a href="BrokerageService.html"
   class="block px-4 py-1 text-white text-sm font-[600] uppercase opacity-75 hover:opacity-100 hover:bg-[#F9FAFB21] transition">
  Brokerage
</a>
```
Links point to the built file name: `PageName.html`.

### Change the logo
There are **two** logo images, one per file, so a logo change is two edits:

| Where | Current file | Background it sits on |
|---|---|---|
| Header (`Nav.astro`) | `IEL Assets/partners/BlackLogoSvg.svg` | white bar → needs a dark/coloured logo |
| Footer (`Footer.astro`) | `IEL Assets/partners/whiteLogoSvg.svg` | dark footer → needs a white/light logo |

**Worked example (applied 2026-10-10):** the Tezi logo now lives at `public/Assets/IELTezi-logo.webp` and both files reference it as `Assets/IELTezi-logo.webp`. The logo is a square badge with its own white background, so it is sized by height only (header `h-[64px] xl:h-[96px] w-auto` — 96px is close to the file's real 208px size but is the most that sits well in the 80px bar; it hangs slightly below it, footer `h-[60px] md:h-[90px] w-auto rounded-lg`) and shows as a white badge on the dark footer. The steps below describe how it was done and how to repeat it for another logo.

1. **Copy the file into `public/`.** Files outside the project folder can't be used, and anything in `public/` is served as-is. Keep names free of spaces:
   ```bash
   cp "G:/My Drive/Websites/IELTezi-logo.webp" "public/IEL Assets/partners/Tezi-logo.webp"
   ```
2. **Point the header at it.** In `Nav.astro` change the `src` (no `public/` prefix, no leading slash):
   ```html
   <img src="IEL Assets/partners/Tezi-logo.webp" alt="IEL Logo" class="h-[52px] w-[103px]" loading="lazy" />
   ```
3. **Footer:** if the Tezi logo is dark, you also need a white/light version for the dark footer. Save it as e.g. `Tezi-logo-white.webp` in the same folder and update the `src` in `Footer.astro`. If one logo works on both backgrounds, reuse the same file in both places.
4. **Fix the size.** The header image is fixed at `h-[52px] w-[103px]` and the footer at `w-[65px] md:w-[145px] h-[40px] md:h-[70px]`. A logo with a different aspect ratio will look stretched. Change to height-only (`class="h-[52px] w-auto"`) or adjust the width to the new ratio.
5. **Rebuild and check** the header on the home page and an inner page, on desktop and mobile width. Hard-refresh (Ctrl+F5) because browsers cache the old logo.

Tips:
- WebP is fine in all modern browsers. Prefer SVG for logos where possible, since it stays sharp at any size.
- **The logo also appears outside the header/footer.** Each page's `<head>` has an `og:image` tag (the preview image when the link is shared) pointing at `https://iel.net.pk/Assets/whiteLogoSvg.svg`, and `index.astro` uses `BlackLogoSvg.svg` several times in its body content. Find them all with a search for `LogoSvg` in `src/` and update those too if you want a full rebrand.
- No page links a favicon at the moment (`public/IEL Assets/partners/favicon.png` exists but is unused). Adding one is a separate change in the head of each page.
- Don't delete the old logo files until you've confirmed nothing references them.

### Menu items on one line (applied)
Desktop menu: top-level items use `whitespace-nowrap text-sm 2xl:text-base` with `space-x-5 2xl:space-x-10`, and dropdown panels use `w-max min-w-[12rem]` with `whitespace-nowrap` links, so nothing wraps (checked at 1280px). If you add more items and they crowd, lower the font size or spacing in these classes. The mobile menu (below `xl`, 1280px) is separate.

### Make dropdown text smaller
On the link classes change `text-sm` → `text-xs`, and `px-4` → `px-3` for tighter padding.

## 3. Footer (Footer.astro)

Contains the logo, the link columns (Main Navigation, Useful Links, Contact), the address, social icons and the disclaimer image. Edit the `<li><a href="...">` entries to change links, or the text/phone/email directly.

## 4. Per-page differences (props, not copies)

Pages pass props to adjust layout without duplicating markup:

```astro
<Nav />                                  <!-- default -->
<Nav navClass="h-[76px] bg-white ..." /> <!-- home page's own nav bar classes -->

<Footer />                               <!-- default: mt-[80px], pt-[60px] md:pt-[100px] -->
<Footer extra="rounded-t-[10px]" padTop="pt-[140px] md:pt-[206px]" />   <!-- home page -->
```

| Prop | Component | Controls | Default |
|---|---|---|---|
| `navClass` | Nav | classes on the `<nav>` tag | `top-0 left-0 w-full z-50` |
| `extra` | Footer | classes on the outer footer `div` (spacing above etc.) | `mt-[80px]` |
| `padTop` | Footer | top padding of the link grid | `pt-[60px] md:pt-[100px]` |

To make a new variation, add a prop in the component's frontmatter (`const { myProp = "default" } = Astro.props;`), use it in the markup, and pass it from the page.

## 5. Gotchas

- Tailwind is loaded from the CDN, so any utility class (including arbitrary values like `h-[80px]`) works immediately.
- Class strings built with props must be written in full (`padTop="pt-[60px]"`), not assembled from fragments.
- Use `class={`...${prop}...`}` (template literal with braces) when a prop sits inside a class attribute.
- Paths are relative (`IEL Assets/...`, `style.css`); keep pages at the site root.
- Known to-do: the logo alt text is "Change Agency Logo" (template leftover); consider changing it to "IEL Logo" in `Nav.astro`.

See also: [DEVELOPERS_GUIDE.md](DEVELOPERS_GUIDE.md).
