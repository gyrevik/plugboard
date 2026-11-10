// Cloudflare Worker entry point. Static files in dist/ are served directly by
// Workers Static Assets; this script only runs for requests that match no file.
import { onRequest, onRequestPost, type Env as SubmitEnv } from "./submit";

interface Env extends SubmitEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/submit" || pathname === "/api/submit/") {
      return request.method === "POST" ? onRequestPost({ request, env }) : onRequest();
    }
    // Anything else falls through to the static site (which serves 404.html for unknown paths).
    return env.ASSETS.fetch(request);
  },
};
