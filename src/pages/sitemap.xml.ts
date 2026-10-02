import type { APIRoute } from "astro";

// Every .astro page under src/pages becomes a sitemap entry, except the 404 page.
// Adding a page to src/pages is enough; nothing else needs updating.
const pages = import.meta.glob("./**/*.astro");

function toPath(file: string): string {
  const route = file.replace(/^\.\//, "").replace(/\.astro$/, "");
  if (route === "index") return "/";
  return `/${route.replace(/\/index$/, "")}/`;
}

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://nitpick.sh");
  const urls = Object.keys(pages)
    .map(toPath)
    .filter((path) => !/(^|\/)404\/$/.test(path))
    .sort()
    .map((path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`)
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
