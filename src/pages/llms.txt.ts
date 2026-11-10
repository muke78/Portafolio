import type { APIRoute } from "astro";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";
import { buildLlmsTxt, getProjectsForLlms, LLMS_LOCALE } from "@/lib/llmsTxt";
import { mediaUrl } from "@/lib/media";
import { getContact } from "@/lib/siteContact";
import { getSiteCopy } from "@/lib/siteCopy";

const DEFAULT_DESCRIPTION =
	"Personal portfolio of Erick González, a full-stack web developer: projects, experience, education and skills. Focus on React, Astro and modern backend architectures. Available in Spanish, English and French.";

/**
 * llms.txt (llmstxt.org): a Markdown index for language models and agents. The
 * origin comes from `site` so it follows SITE_URL like robots.txt and the sitemap;
 * contact data, the CV and the projects come from the same sources as the site, and
 * each one falls back to nothing (never to an error) if the backend does not answer.
 */
export const GET: APIRoute = async ({ site, url }) => {
	const origin = (site ?? new URL(url.origin)).origin;

	const [contact, copy, projects] = await Promise.all([
		getContact(),
		getSiteCopy(LLMS_LOCALE),
		getProjectsForLlms(),
	]);

	const body = buildLlmsTxt({
		origin,
		locales: LOCALES,
		defaultLocale: DEFAULT_LOCALE,
		description: DEFAULT_DESCRIPTION,
		contact,
		cvUrl: copy?.cv_pdf ? mediaUrl(copy.cv_pdf) : null,
		projects,
	});

	return new Response(body, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=300, s-maxage=3600",
		},
	});
};
