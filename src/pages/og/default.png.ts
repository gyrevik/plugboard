import { renderCard, pngResponse } from "../../og/card";
import { SERVERS } from "../../data/servers";

export function GET() {
  const remote = SERVERS.filter((s) => s.transport.includes("http")).length;
  const official = SERVERS.filter((s) => s.official).length;
  return pngResponse(
    renderCard({
      eyebrow: "MCP server directory",
      title: "Find an MCP server for the tools you already use",
      summary: "Filter by what they connect to, how they run, and how they sign in. Every listing is checked against its source each month.",
      chips: [`${SERVERS.length} servers`, `${remote} remote`, `${official} vendor-built`],
    }),
  );
}
