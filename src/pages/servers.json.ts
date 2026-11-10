// Built as /servers.json: the published listings in a compact form, used by
// the submit form and the Worker to spot duplicates. Also handy as a public API.
import { SERVERS } from "../data/servers";

export function GET() {
  const listings = SERVERS.map(({ slug, name, url, endpoint }) => ({ slug, name, url, ...(endpoint ? { endpoint } : {}) }));
  return new Response(JSON.stringify(listings), { headers: { "content-type": "application/json" } });
}
