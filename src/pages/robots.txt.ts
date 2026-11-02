import type { APIRoute } from "astro";

/**
 * robots.txt generado desde `site` (astro.config.mjs, variable SITE_URL): el
 * sitemap apunta siempre al mismo dominio que el resto del sitio, sin repetir
 * la URL en un archivo estatico.
 */
export const GET: APIRoute = ({ site, url }) => {
	const origin = site ?? new URL(url.origin);
	const body = [
		"User-agent: *",
		"Allow: /",
		"Disallow: /api",
		"",
		`Sitemap: ${new URL("/sitemap-index.xml", origin).toString()}`,
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
