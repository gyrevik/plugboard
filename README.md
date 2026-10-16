# Plugboard

A static directory of Model Context Protocol servers, built with Astro.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Before deploying

1. Set `SITE_URL` and `REPO_URL` in `src/config.ts`.
2. Update the `Sitemap:` line in `public/robots.txt` to match.
3. Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## How it's organized

| Path | What it is |
|---|---|
| `src/data/servers/*.json` | One file per listing. The file name is the URL slug. |
| `src/data/servers.ts` | Loads and validates listings; a bad file fails the build with a clear message. |
| `src/data/categories.ts` | Category ids, labels, colors and blurbs. |
| `src/pages/index.astro` | Home: every server, with client-side search and filters. |
| `src/pages/categories/[cat].astro` | One page per category. |
| `src/pages/servers/[slug].astro` | One page per server, with JSON-LD. |
| `src/pages/submit.astro` | How to submit (GitHub issue form or pull request). |

## Adding a server

Add `src/data/servers/<slug>.json`. See `/submit` on the site for the fields.
