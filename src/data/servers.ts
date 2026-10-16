import { CATEGORY } from "./categories";

export type Transport = "stdio" | "http";
export type Auth = "none" | "oauth" | "api-key" | "credentials";

export interface Server {
  /** File name without .json; used in the URL */
  slug: string;
  name: string;
  maintainer: string;
  official: boolean;
  category: string;
  transport: Transport[];
  auth: Auth;
  lang?: string;
  url: string;
  endpoint?: string;
  summary: string;
  tags: string[];
  addedAt: string;
}

export const AUTH_SHORT: Record<Auth, string> = {
  none: "no sign-in",
  oauth: "OAuth",
  "api-key": "API key",
  credentials: "own credentials",
};

export const AUTH_LONG: Record<Auth, string> = {
  none: "None needed",
  oauth: "OAuth in the browser",
  "api-key": "API key or token",
  credentials: "Your own service credentials or connection string",
};

const TRANSPORTS = new Set(["stdio", "http"]);
const AUTHS = new Set(Object.keys(AUTH_SHORT));

// Fail the build with a clear message instead of shipping a broken listing.
function validate(slug: string, d: any): Server {
  const problems: string[] = [];
  const req = ["name", "maintainer", "category", "auth", "url", "summary", "addedAt"];
  for (const k of req) if (typeof d[k] !== "string" || !d[k].trim()) problems.push(`"${k}" is required`);
  if (d.category && !CATEGORY[d.category]) problems.push(`unknown category "${d.category}"`);
  if (d.auth && !AUTHS.has(d.auth)) problems.push(`unknown auth "${d.auth}"`);
  if (!Array.isArray(d.transport) || !d.transport.length || d.transport.some((t: string) => !TRANSPORTS.has(t)))
    problems.push(`"transport" must list "stdio" and/or "http"`);
  for (const k of ["url", "endpoint"]) if (d[k] && !/^https?:\/\//.test(d[k])) problems.push(`"${k}" must start with http(s)://`);
  if (d.addedAt && !/^\d{4}-\d{2}-\d{2}$/.test(d.addedAt)) problems.push(`"addedAt" must be YYYY-MM-DD`);
  if (!/^[a-z0-9-]+$/.test(slug)) problems.push(`file name must be lowercase letters, digits and dashes`);
  if (problems.length) throw new Error(`src/data/servers/${slug}.json: ${problems.join("; ")}`);
  return { official: false, tags: [], ...d, slug };
}

const files = import.meta.glob("./servers/*.json", { eager: true, import: "default" });

export const SERVERS: Server[] = Object.entries(files)
  .map(([path, data]) => validate(path.split("/").pop()!.replace(/\.json$/, ""), data))
  .sort((a, b) => a.name.localeCompare(b.name));

export const serversIn = (category: string) => SERVERS.filter((s) => s.category === category);
