# Plugboard

A static directory of Model Context Protocol servers, built with Astro.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Deploying to Cloudflare Pages

1. Set `SITE_URL` in `src/config.ts` and the `Sitemap:` line in `public/robots.txt` to your domain.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
   - Framework preset: **Astro** (build command `npm run build`, output directory `dist`)
3. Create a GitHub token for the submit form: GitHub → Settings → Developer settings →
   **Fine-grained tokens** → repository access: only this repo → permissions: **Issues: Read and write**.
4. In the Pages project: **Settings → Variables and Secrets**, add `GITHUB_TOKEN` as a **secret**.
   (`GITHUB_REPO` is already set in `wrangler.toml`.)
5. Recommended, to keep bots out: create a **Turnstile** widget (Cloudflare dashboard → Turnstile) for your domain, then add
   - `TURNSTILE_SECRET_KEY` as a secret, and
   - `PUBLIC_TURNSTILE_SITE_KEY` as a plain variable (it's read at build time, so redeploy after adding it).
6. Redeploy. Every push to `main` rebuilds the site.

## The submit form

`/submit` posts to `functions/api/submit.ts`, a Cloudflare Pages Function. It validates the
fields, drops obvious bots (a hidden honeypot field, a minimum fill time, and Turnstile if
configured), and opens a GitHub issue labeled `submission` containing a ready-to-commit
listing file. Accept a submission by adding that file under `src/data/servers/`.

Without `GITHUB_TOKEN` the endpoint replies that submissions aren't set up and points people
to the GitHub issue form, which keeps working regardless.

To try the function locally: put `GITHUB_TOKEN=...` in `.dev.vars` (git-ignored), then `npm run preview:cf`.

## How it's organized

| Path | What it is |
|---|---|
| `src/data/servers/*.json` | One file per listing. The file name is the URL slug. |
| `src/data/servers.ts` | Loads and validates listings; a bad file fails the build with a clear message. |
| `src/data/categories.ts` | Category ids, labels, colors and blurbs. |
| `src/pages/index.astro` | Home: every server, with client-side search and filters. |
| `src/pages/categories/[cat].astro` | One page per category. |
| `src/pages/servers/[slug].astro` | One page per server, with JSON-LD. |
| `src/pages/submit.astro` | Submit form, plus the GitHub issue and pull request routes. |
| `functions/api/submit.ts` | Cloudflare Pages Function that turns a form post into a GitHub issue. |

## Adding a server

Add `src/data/servers/<slug>.json`. See `/submit` on the site for the fields.
