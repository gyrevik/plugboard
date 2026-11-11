// Social preview cards (1200x630 PNG), rendered at build time from an SVG template.
// Uses the site's dark palette and fonts so shared links look like the site.
import { Resvg } from "@resvg/resvg-js";
import path from "node:path";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const C = {
  bg: "#0F151A",
  panel: "#161F26",
  hole: "#1D2831",
  ink: "#E2E8ED",
  muted: "#93A1AD",
  line: "#2C3A46",
  accent: "#55B9BF",
  brass: "#D9AA55",
  brassSoft: "#2E2615",
};

/** Dark-theme category colors, matching --c-* in global.css */
export const CATEGORY_COLORS: Record<string, string> = {
  dev: "#7C9DE6", work: "#B08FE0", browser: "#E88A5E", search: "#63C48C", data: "#55B9BF",
  cloud: "#85B2D4", commerce: "#D9AA55", automation: "#E27FA6", creative: "#C8997A", reference: "#9AA7B2",
};

const FONT_DIR = path.join(process.cwd(), "src", "og", "fonts");
const FONTS = ["BricolageGrotesque-ExtraBold", "BricolageGrotesque-SemiBold", "SchibstedGrotesk-Regular", "IBMPlexMono-Medium"].map(
  (f) => path.join(FONT_DIR, `${f}.ttf`),
);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Greedy word wrap by an estimated average glyph width. Returns null if it needs more than maxLines. */
function wrap(text: string, maxWidth: number, size: number, charEm: number, maxLines: number): string[] | null {
  const maxChars = Math.floor(maxWidth / (size * charEm));
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length <= maxLines ? lines : null;
}

/** Wrap to maxLines, cutting with an ellipsis if the text is still too long. */
function clamp(text: string, maxWidth: number, size: number, charEm: number, maxLines: number): string[] {
  const fit = wrap(text, maxWidth, size, charEm, maxLines);
  if (fit) return fit;
  const maxChars = Math.floor(maxWidth / (size * charEm)) * maxLines;
  let cut = text.slice(0, maxChars - 1);
  cut = cut.slice(0, cut.lastIndexOf(" ")) + "…";
  return wrap(cut, maxWidth, size, charEm, maxLines) ?? [cut];
}

export interface CardInput {
  eyebrow: string;
  eyebrowColor?: string;
  title: string;
  summary: string;
  /** Bottom row. Omit `ports` for cards that aren't about one server. */
  ports?: { stdio: boolean; http: boolean };
  chips?: string[];
  stamp?: string;
  footnote?: string;
}

function jack(x: number, label: string, on: boolean) {
  return `<g transform="translate(${x} 0)">
    <circle cx="17" cy="17" r="15" fill="none" stroke="${on ? C.accent : C.line}" stroke-width="3"/>
    <circle cx="17" cy="17" r="6" fill="${on ? C.accent : C.line}"/>
    <text x="44" y="24" font-family="IBM Plex Mono" font-weight="500" font-size="20" letter-spacing="1.5" fill="${on ? C.ink : C.muted}">${label}</text>
  </g>`;
}

export function cardSvg(c: CardInput): string {
  const left = 80;
  const textWidth = 1040;

  // Title: largest size that fits in two lines
  let titleSize = 84;
  let titleLines: string[] | null = null;
  for (const size of [84, 74, 64, 56]) {
    titleLines = wrap(c.title, textWidth, size, 0.56, 2);
    titleSize = size;
    if (titleLines) break;
  }
  titleLines ??= clamp(c.title, textWidth, titleSize, 0.56, 2);
  const eyebrowY = 190;
  const titleTop = eyebrowY + 30 + Math.round(titleSize * 0.82);
  const titleLead = titleSize * 1.04;
  const summaryTop = titleTop + titleLead * (titleLines.length - 1) + 64;
  const summaryLines = clamp(c.summary, textWidth, 30, 0.5, titleLines.length > 1 ? 2 : 3);

  let x = 0;
  const bottom: string[] = [];
  if (c.ports) {
    bottom.push(jack(x, "LOCAL", c.ports.stdio));
    x += 170;
    bottom.push(jack(x, "REMOTE", c.ports.http));
    x += 190;
  }
  for (const chip of c.chips ?? []) {
    const w = chip.length * 12.4 + 34;
    bottom.push(`<g transform="translate(${x} 0)"><rect x="0" y="1" width="${w}" height="32" rx="16" fill="none" stroke="${C.line}" stroke-width="2"/>
      <text x="${w / 2}" y="24" text-anchor="middle" font-family="IBM Plex Mono" font-weight="500" font-size="19" fill="${C.ink}">${esc(chip)}</text></g>`);
    x += w + 16;
  }
  if (c.stamp) {
    const w = c.stamp.length * 12.6 + 28;
    bottom.push(`<g transform="translate(${x} 0)"><rect x="0" y="1" width="${w}" height="32" rx="5" fill="${C.brassSoft}"/>
      <text x="${w / 2}" y="24" text-anchor="middle" font-family="IBM Plex Mono" font-weight="500" font-size="18" letter-spacing="1.5" fill="${C.brass}">${esc(c.stamp.toUpperCase())}</text></g>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <pattern id="holes" width="44" height="44" patternUnits="userSpaceOnUse">
      <circle cx="22" cy="22" r="7" fill="none" stroke="${C.hole}" stroke-width="2"/>
    </pattern>
    <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${C.bg}" stop-opacity="1"/>
      <stop offset="0.55" stop-color="${C.bg}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="${C.bg}"/>
  <rect width="100%" height="100%" fill="url(#holes)"/>
  <rect width="100%" height="100%" fill="url(#fade)"/>
  <rect x="0" y="0" width="${OG_WIDTH}" height="10" fill="${C.accent}"/>

  <g transform="translate(${left} 66)">
    <g transform="scale(1.75)" fill="none" stroke="${C.accent}" stroke-width="2.4" stroke-linecap="round">
      <circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M6 9v3a6 6 0 0 0 6 6h3"/>
    </g>
    <text x="58" y="34" font-family="Bricolage Grotesque" font-weight="800" font-size="36" fill="${C.ink}">Plugboard</text>
  </g>
  <text x="${OG_WIDTH - left}" y="100" text-anchor="end" font-family="IBM Plex Mono" font-weight="500" font-size="22" fill="${C.muted}">plugboard.us</text>

  <g transform="translate(${left} ${eyebrowY})">
    <circle cx="7" cy="-7" r="7" fill="${c.eyebrowColor ?? C.accent}"/>
    <text x="26" y="0" font-family="IBM Plex Mono" font-weight="500" font-size="21" letter-spacing="2" fill="${C.muted}">${esc(c.eyebrow.toUpperCase())}</text>
  </g>
  ${titleLines.map((l, i) => `<text x="${left}" y="${titleTop + i * titleLead}" font-family="Bricolage Grotesque" font-weight="800" font-size="${titleSize}" letter-spacing="-1.5" fill="${C.ink}">${esc(l)}</text>`).join("\n  ")}
  ${summaryLines.map((l, i) => `<text x="${left}" y="${summaryTop + i * 42}" font-family="Schibsted Grotesk" font-size="30" fill="${C.muted}">${esc(l)}</text>`).join("\n  ")}

  <line x1="${left}" x2="${OG_WIDTH - left}" y1="512" y2="512" stroke="${C.line}" stroke-width="2"/>
  <g transform="translate(${left} 540)">${bottom.join("")}</g>
  ${c.footnote ? `<text x="${OG_WIDTH - left}" y="564" text-anchor="end" font-family="IBM Plex Mono" font-weight="500" font-size="20" fill="${C.muted}">${esc(c.footnote)}</text>` : ""}
</svg>`;
}

export function renderCard(c: CardInput): Uint8Array {
  const png = new Resvg(cardSvg(c), {
    fitTo: { mode: "width", value: OG_WIDTH },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Schibsted Grotesk" },
  })
    .render()
    .asPng();
  return new Uint8Array(png);
}

export const pngResponse = (png: Uint8Array) => new Response(png, { headers: { "content-type": "image/png" } });
