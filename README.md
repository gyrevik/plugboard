# Plugboard

A static directory of Model Context Protocol servers, built with Astro.

## Run it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Deploying to Cloudflare (Workers)

The site deploys as a Cloudflare Worker with static assets: `dist/` is served as-is, and
`worker/index.ts` handles only `/api/submit`. Settings live in `wrangler.toml`.

1. Set `SITE_URL` in `src/config.ts` and the `Sitemap:` line in `public/robots.txt` to your domain.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Import a repository**, pick this repo.
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - The Worker's name must match `name` in `wrangler.toml` (`plugboard`).
3. Create a GitHub token for the submit form: GitHub → Settings → Developer settings →
   **Fine-grained tokens** → repository access: only this repo → permissions: **Issues: Read and write**.
4. In the Worker: **Settings → Variables and Secrets**, add `GITHUB_TOKEN` as a **secret**.
   (`GITHUB_REPO` is set in `wrangler.toml`; plain variables added in the dashboard are
   overwritten on each deploy, secrets are kept.)
5. Recommended, to keep bots out: create a **Turnstile** widget (Cloudflare dashboard → Turnstile) for your domain, then add
   - `TURNSTILE_SECRET_KEY` as a secret under **Settings → Variables and Secrets**, and
   - `PUBLIC_TURNSTILE_SITE_KEY` under **Settings → Build → Variables and secrets** (it's read
     at build time, so trigger a new build after adding it).
6. Every push to `main` rebuilds and deploys.

## The submit form

`/submit` posts to `/api/submit`, handled by `worker/submit.ts`. It validates the
fields, drops obvious bots (a hidden honeypot field, a minimum fill time, and Turnstile if
configured), and opens a GitHub issue labeled `submission` containing a ready-to-commit
listing file. Accept a submission by adding that file under `src/data/servers/`.

Without `GITHUB_TOKEN` the endpoint replies that submissions aren't set up and points people
to the GitHub issue form, which keeps working regardless.

To try it locally: put `GITHUB_TOKEN=...` in `.dev.vars` (git-ignored), then `npm run preview:cf`.

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
| `worker/index.ts` | Cloudflare Worker entry: routes `/api/submit`, everything else is static. |
| `worker/submit.ts` | Turns a submit-form post into a GitHub issue. |

## Adding a server

Add `src/data/servers/<slug>.json`. See `/submit` on the site for the fields.
