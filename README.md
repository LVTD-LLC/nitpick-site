# nitpick-site

Marketing site for [nitpick](https://github.com/LVTD-LLC/nitpick), AI code review for AI agents.

Static [Astro](https://astro.build) site, served by nginx from a CapRover app. Live at https://nitpick.sh.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # astro check + astro build into dist/
npm run preview    # serve dist/ locally
```

Node 22 or newer.

## Artwork

The dithered landscapes in `public/art/` are generated, not drawn. Regenerate them with:

```bash
npm run art        # python3 scripts/dither.py, needs Pillow
```

The script is deterministic; commit the PNGs it writes.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: build, tar `Dockerfile` + `nginx.conf` + `captain-definition` + `dist/`, and `caprover deploy` with an app token. Three repository secrets are required:

| secret | value |
|---|---|
| `CAPROVER_URL` | CapRover origin, e.g. `https://captain.cr.lvtd.dev` |
| `CAPROVER_APP` | app name, `nitpick` |
| `CAPROVER_APP_TOKEN` | the app's deploy token from App Configs in CapRover |

To deploy by hand from a machine logged in with the `caprover` CLI:

```bash
npm run build && tar -czf /tmp/nitpick-site.tar.gz Dockerfile nginx.conf captain-definition dist
caprover deploy -n captain-01 -a nitpick -t /tmp/nitpick-site.tar.gz
```

## Review

Run `nitpick` from the repo root before opening a PR; `.nitpick.toml` carries the site-specific instructions. It needs `NITPICK_OPENROUTER_API_KEY` in the environment.
