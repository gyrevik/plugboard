import { renderCard, pngResponse, CATEGORY_COLORS } from "../../../og/card";
import { serversIn } from "../../../data/servers";
import { CATEGORIES, type Category } from "../../../data/categories";

export function getStaticPaths() {
  return CATEGORIES.filter((c) => serversIn(c.id).length > 0).map((c) => ({ params: { cat: c.id }, props: { category: c } }));
}

export function GET({ props }: { props: { category: Category } }) {
  const c = props.category;
  const servers = serversIn(c.id);
  return pngResponse(
    renderCard({
      eyebrow: "Category",
      eyebrowColor: CATEGORY_COLORS[c.id],
      title: `${c.label} MCP servers`,
      summary: c.blurb,
      chips: [`${servers.length} servers`, `${servers.filter((s) => s.transport.includes("http")).length} remote`],
    }),
  );
}
