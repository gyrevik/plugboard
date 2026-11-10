// Duplicate detection shared by the submit form (instant hints) and the
// Worker (the final check). Keep it dependency-free: both bundle it.

export interface ListingRef {
  slug: string;
  name: string;
  url: string;
  endpoint?: string;
}

/** Comparable form of a link: no scheme, "www.", query, hash, ".git" or trailing slash; lowercase host. */
export function normalizeUrl(raw: string | undefined): string {
  if (!raw) return "";
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const path = u.pathname.replace(/\/+$/, "").replace(/\.git$/, "").replace(/\/+$/, "");
    return host + path.toLowerCase();
  } catch {
    return "";
  }
}

/** Comparable form of a name: "Linear MCP Server" and "linear" both become "linear". */
export function normalizeName(raw: string | undefined): string {
  return (raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/(mcp)?(server)?$/, "")
    .replace(/^mcp/, "");
}

export interface Match {
  listing: ListingRef;
  /** "link" and "endpoint" are certain duplicates; "name" only might be. */
  on: "link" | "endpoint" | "name";
}

export function findMatches(candidate: { name?: string; url?: string; endpoint?: string }, listings: ListingRef[]): Match[] {
  const url = normalizeUrl(candidate.url);
  const endpoint = normalizeUrl(candidate.endpoint);
  const name = normalizeName(candidate.name);
  const out: Match[] = [];
  for (const l of listings) {
    if (url && normalizeUrl(l.url) === url) out.push({ listing: l, on: "link" });
    else if (endpoint && normalizeUrl(l.endpoint) === endpoint) out.push({ listing: l, on: "endpoint" });
    else if (name && normalizeName(l.name) === name) out.push({ listing: l, on: "name" });
  }
  return out;
}

export const isCertain = (m: Match) => m.on !== "name";
