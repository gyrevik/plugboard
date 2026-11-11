import { renderCard, pngResponse, CATEGORY_COLORS } from "../../../og/card";
import { SERVERS, AUTH_SHORT, type Server } from "../../../data/servers";
import { CATEGORY } from "../../../data/categories";

export function getStaticPaths() {
  return SERVERS.map((s) => ({ params: { slug: s.slug }, props: { server: s } }));
}

export function GET({ props }: { props: { server: Server } }) {
  const s = props.server;
  return pngResponse(
    renderCard({
      eyebrow: CATEGORY[s.category].label,
      eyebrowColor: CATEGORY_COLORS[s.category],
      title: `${s.name} MCP server`,
      summary: s.summary,
      ports: { stdio: s.transport.includes("stdio"), http: s.transport.includes("http") },
      chips: [AUTH_SHORT[s.auth]],
      stamp: s.official ? "Vendor-built" : undefined,
      footnote: s.checkedAt ? `Checked ${s.checkedAt}` : undefined,
    }),
  );
}
