# AGENTS.md

Instructions for coding agents working in this repository. `CLAUDE.md` points here.

## What this is

The marketing site for nitpick (https://github.com/LVTD-LLC/nitpick). A static Astro site with one landing page and a 404 page, styled after a flat, grid-ruled developer-tools landing page: white canvas, pale-blue surfaces, orange-red highlight marks on headline words, black pill buttons, dithered landscape artwork, monospace labels.

Everything the site says about nitpick must be true of the CLI as documented in its README. Do not invent features, numbers, customers, or benchmarks. When the CLI changes, update the copy here.

## Commands

Run before every commit. There is no CI that builds the site; the deploy workflow only runs on `main`.

```bash
npm run build     # astro check (types, a11y hints) + production build
nitpick           # AI review of your diff; fix or dismiss every high/blocker finding
```

`npm run art` regenerates `public/art/*.png` from `scripts/dither.py` (needs Pillow). Only run it when the artwork itself should change, and commit the result.

## Layout

```
src/layouts/Base.astro       html head, fonts, nav + footer, skip link
src/components/Nav.astro     sticky header
src/components/Footer.astro  orange footer with link columns
src/components/Logo.astro    the orange "n" mark
src/pages/index.astro        the landing page; copy lives in the frontmatter arrays
src/pages/404.astro
src/styles/global.css        tokens (colors, fonts, frame width), pills, marks, terminal blocks
scripts/dither.py            procedural artwork generator
Dockerfile, nginx.conf, captain-definition   CapRover image: nginx serving dist/
.github/workflows/deploy.yml                 build + caprover deploy on push to main
```

## Conventions

- No UI framework, no Tailwind, no client-side dependencies. Small inline `<script>` blocks in `.astro` files are fine.
- Colors and fonts come from the custom properties in `global.css`. Do not hardcode new hex values in components without adding a token.
- The page is a sequence of `<section class="band">` blocks, each wrapping a `.frame`. The frame's left and right borders are the vertical rules that run the page; keep every section inside one so the lines stay continuous.
- Keep it accessible: real buttons for actions, `aria-selected`/`hidden` on the tab-like selector, focus styles on everything interactive, decorative images with empty `alt`.
- Fonts load from Google Fonts. Everything else is inline or under `public/`.

## Deploy

Push to `main`. The workflow needs `CAPROVER_URL`, `CAPROVER_APP` and `CAPROVER_APP_TOKEN` as repository secrets. See `README.md` for manual deploys.
