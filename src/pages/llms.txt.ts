import type { APIRoute } from "astro";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";

/**
 * llms.txt (llmstxt.org): a short Markdown index for language models. It is
 * generated from `site` so it follows SITE_URL like robots.txt and the sitemap.
 */
export const GET: APIRoute = ({ site, url }) => {
	const origin = (site ?? new URL(url.origin)).origin;
	const pages = LOCALES.map(
		(locale) => `- [Home (${locale})](${origin}/${locale}/home)`,
	);

	const body = [
		"# Erick González (muke78)",
		"",
		"> Personal portfolio of Erick González, a full-stack web developer: projects, experience, education and skills. Available in Spanish, English and French.",
		"",
		"## Pages",
		"",
		...pages,
		"",
		"## Notes",
		"",
		`- Default language: ${DEFAULT_LOCALE}.`,
		`- [Sitemap](${origin}/sitemap-index.xml)`,
		"",
	].join("\n");

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
