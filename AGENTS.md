# AGENTS.md

Instructions for coding agents working in this repository. `CLAUDE.md` points here.

## What this is

The marketing site for nitpick (https://github.com/LVTD-LLC/nitpick). A static Astro site with one landing page and a 404 page. The page has four parts, in order: a headline, a one-line prompt the visitor pastes into their coding agent, pointing it at the `nitpick-setup` skill, a short explanation of how nitpick works (it sends the change to a second model through OpenRouter), and real terminal recordings of a few commands. Keep it that short.

Everything the site says about nitpick must be true of the CLI as documented in its README, and the paste-in prompt must point at the `nitpick-setup` skill in https://github.com/LVTD-LLC/nitpick-skills (the setup steps live there, not here). Do not invent features, numbers, customers, or benchmarks. When the CLI or the skill changes, update the copy and the prompt here.

## Commands

Run before every commit. There is no CI that builds the site; the deploy workflow only runs on `main`.

```bash
npm run build     # astro check (types, a11y hints) + production build
nitpick           # AI review of your diff; fix or dismiss every high/blocker finding
```

## Layout

```
src/layouts/Base.astro       html head, fonts, nav + footer, skip link
src/components/Nav.astro     header: logo, skill link, GitHub button
src/components/Footer.astro  one-row orange footer
src/components/Logo.astro    the tweezers-and-robot logo (public/logo.png)
src/components/Cast.astro    asciinema-player wrapper; reads the cast at build time to poster its last frame
src/pages/index.astro        the landing page; the prompt and all copy live in the frontmatter
src/pages/404.astro
src/styles/global.css        tokens (colors, fonts, frame width), pills, marks
public/casts/*.cast          asciicast v3 recordings shown on the page
public/art/hero.png          only used as the Open Graph image; scripts/dither.py regenerates it (needs Pillow)
Dockerfile, nginx.conf, captain-definition   CapRover image: nginx serving dist/
.github/workflows/deploy.yml                 build + caprover deploy on push to main
```

## Conventions

- No UI framework, no Tailwind. The only client-side dependency is `asciinema-player`, imported from `Cast.astro`. Small inline `<script>` blocks in `.astro` files are fine.
- Colors and fonts come from the custom properties in `global.css`. Do not hardcode new hex values in components without adding a token.
- The page is a sequence of `<section class="band">` blocks, each wrapping a `.frame`. The frame's left and right borders are the vertical rules that run the page; keep every section inside one so the lines stay continuous.
- Keep it accessible: real buttons for actions, focus styles on everything interactive, decorative images with empty `alt`.
- Fonts load from Google Fonts. Everything else is inline or under `public/`.

## Recordings

The casts are real `nitpick` runs, not mock-ups. To re-record one, clone `LVTD-LLC/nitpick` somewhere disposable, plant a small bug on a branch, and record with the asciinema CLI (3.x) in headless mode:

```bash
asciinema rec --headless --window-size 100x32 --idle-time-limit 2 --title "nitpick" \
  -c 'bash --norc --noprofile -c "printf \"\\$ nitpick\\n\"; nitpick"' review.cast
```

Strip the `command` and `env` keys from the header line before committing the file to `public/casts/`; they leak local paths. `Cast.astro` reads `term.cols`, `term.rows`, and the event intervals from the file, so no other change is needed.

## Deploy

Push to `main`. The workflow needs `CAPROVER_URL`, `CAPROVER_APP` and `CAPROVER_APP_TOKEN` as repository secrets. See `README.md` for manual deploys.
