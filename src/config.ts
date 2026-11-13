// Change these before deploying.
export const SITE_URL = "https://plugboard.us";
export const SITE_NAME = "Plugboard";
export const SITE_TAGLINE =
  "A directory of Model Context Protocol servers. Filter by what they connect to, how they run, and how they sign in.";
// GitHub repo that hosts this site; used for "Submit a server" and "Edit this listing" links.
export const REPO_URL = "https://github.com/gyrevik/plugboard";
// Cloudflare Turnstile site key for the submit form's bot check. It's public (it ships in the
// page), so it lives here. The matching secret key goes only in the Worker's secrets as
// TURNSTILE_SECRET_KEY. Leave empty to turn the widget off.
export const TURNSTILE_SITE_KEY = "0x4AAAAAAF0aHLttMGg6IfdQ";
