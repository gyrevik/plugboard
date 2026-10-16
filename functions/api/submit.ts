// POST /api/submit — turns a "Submit a server" form post into a GitHub issue.
// Runs as a Cloudflare Pages Function. Configure in the Pages dashboard:
//   GITHUB_TOKEN          (secret) fine-grained token: this repo only, Issues read/write
//   GITHUB_REPO           "owner/name", set in wrangler.toml
//   TURNSTILE_SECRET_KEY  (secret, optional but recommended) enables the bot check

interface Env {
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  TURNSTILE_SECRET_KEY?: string;
}

type Ctx = { request: Request; env: Env };

const CATEGORIES = ["dev", "work", "browser", "search", "data", "cloud", "commerce", "automation", "creative", "reference"];
const AUTHS = ["none", "oauth", "api-key", "credentials"];
const MIN_FILL_MS = 3000; // humans take longer than this to fill the form

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });

const str = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max) : "");

function httpUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : "";
  } catch {
    return "";
  }
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "server";

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) return (await request.json()) as Record<string, unknown>;
  const form = await request.formData();
  const out: Record<string, unknown> = {};
  for (const [k, v] of form) out[k] = k === "transport" ? form.getAll(k) : v;
  return out;
}

async function passesTurnstile(secret: string, token: string, ip: string | null) {
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return json(503, { error: "Submissions aren't set up on this site yet. Please use the GitHub issue form instead." });
  }

  let d: Record<string, unknown>;
  try {
    d = await readBody(request);
  } catch {
    return json(400, { error: "That request couldn't be read. Reload the page and try again." });
  }

  // Spam traps: a hidden field humans never fill, and a minimum time on the page.
  // Pretend success so bots don't learn what tripped them.
  const started = Number(d.started);
  if (str(d.website, 200) || !Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) {
    return json(200, { ok: true });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await passesTurnstile(env.TURNSTILE_SECRET_KEY, str(d["cf-turnstile-response"], 4096), request.headers.get("CF-Connecting-IP"));
    if (!ok) return json(400, { error: "The bot check didn't pass. Reload the page and try again." });
  }

  const transport = (Array.isArray(d.transport) ? d.transport : [d.transport]).filter((t): t is string => t === "stdio" || t === "http");
  const listing = {
    name: str(d.name, 80),
    maintainer: str(d.maintainer, 80),
    official: false,
    category: str(d.category, 20),
    transport: [...new Set(transport)],
    auth: str(d.auth, 20),
    url: httpUrl(str(d.url, 300)),
    endpoint: httpUrl(str(d.endpoint, 300)) || undefined,
    summary: str(d.summary, 280),
    tags: [] as string[],
    addedAt: new Date().toISOString().slice(0, 10),
  };
  const contact = str(d.contact, 120);

  const problems: string[] = [];
  if (!listing.name) problems.push("a server name");
  if (!listing.url) problems.push("a link that starts with https://");
  if (!listing.summary) problems.push("a short description");
  if (!CATEGORIES.includes(listing.category)) problems.push("a category");
  if (!AUTHS.includes(listing.auth)) problems.push("a sign-in method");
  if (!listing.transport.length) problems.push("at least one way the server runs");
  if (problems.length) return json(400, { error: `Add ${problems.join(", ")}.` });

  // Everything the submitter typed goes inside one fenced JSON block, so it can't
  // add markdown, links or @mentions to the issue. Strip anything that could close the fence.
  const fileJson = JSON.stringify(listing, null, 2).replace(/`{3,}/g, "``");
  const slug = slugify(listing.name);
  const body = [
    "Submitted through the form on the site.",
    "",
    `To accept it, check the details and add this as \`src/data/servers/${slug}.json\`:`,
    "",
    "````json",
    fileJson,
    "````",
    ...(contact ? ["", "Submitter contact (not published on the site):", "", "````text", contact.replace(/`{3,}/g, "``"), "````"] : []),
  ].join("\n");

  const gh = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "plugboard-submit",
      "content-type": "application/json",
    },
    body: JSON.stringify({ title: `Add server: ${listing.name}`, body, labels: ["submission"] }),
  });

  if (!gh.ok) {
    console.error("GitHub issue create failed", gh.status, await gh.text());
    return json(502, { error: "Your submission couldn't be saved just now. Try again in a few minutes." });
  }
  const issue = (await gh.json()) as { number: number; html_url: string };
  return json(200, { ok: true, issue: issue.number, url: issue.html_url });
}

export function onRequest(): Response {
  return json(405, { error: "Use POST." });
}
