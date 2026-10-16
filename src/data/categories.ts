export interface Category {
  id: string;
  label: string;
  /** CSS custom property holding the category's cable color */
  color: string;
  blurb: string;
}

export const CATEGORIES: Category[] = [
  { id: "dev", label: "Developer tools", color: "--c-dev", blurb: "Code hosting, error tracking, observability and local dev tooling." },
  { id: "work", label: "Work management", color: "--c-work", blurb: "Issue trackers, wikis and project tools your team already lives in." },
  { id: "browser", label: "Browser automation", color: "--c-browser", blurb: "Servers that drive a real browser: click, type, read pages, debug." },
  { id: "search", label: "Search & docs", color: "--c-search", blurb: "Web search, crawling and up-to-date library documentation." },
  { id: "data", label: "Databases", color: "--c-data", blurb: "SQL, NoSQL, analytics warehouses and vector stores." },
  { id: "cloud", label: "Cloud & infra", color: "--c-cloud", blurb: "Cloud providers, hosting platforms, Kubernetes and infrastructure as code." },
  { id: "commerce", label: "Payments & commerce", color: "--c-commerce", blurb: "Payments, billing, invoices and storefront APIs." },
  { id: "automation", label: "Automation & messaging", color: "--c-automation", blurb: "Workflow platforms and messaging APIs." },
  { id: "creative", label: "Design & ML", color: "--c-creative", blurb: "Design files and machine learning hubs." },
  { id: "reference", label: "Reference servers", color: "--c-reference", blurb: "The MCP project's own reference implementations. Good starting points." },
];

export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, Category>;
