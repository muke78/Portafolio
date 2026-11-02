import { defineMiddleware } from "astro:middleware";
import { isLocale } from "@/i18n/locales";
import { withSecurityHeaders } from "@/lib/securityHeaders";

// Routes that intentionally live outside the /[lang]/* locale tree and
// must never be caught by the locale guard below. "404" has to be here
// too - ctx.rewrite("/404") re-enters this same middleware, and without
// the exemption it would rewrite to /404 forever ("Loop Detected").
// "_image" is Astro's own on-demand image transform endpoint
// (astro:assets <Image>/<Picture>) - without this exemption every
// optimized image 404s the moment a real one is used, since its request
// path doesn't look like a file and isn't a locale either.
const NON_LOCALE_ROOTS = ["api", "404", "_image"];

// i18n routing is set to "manual" in astro.config.mjs specifically so
// that /api/* isn't swallowed by Astro's automatic
// locale-prefix routing (which used to 404 any unprefixed path). That
// means locale validation for /[lang]/* now has to happen here: an
// unknown locale segment (e.g. /xx/home) renders the real 404 page
// instead of silently falling back to the default locale.
const localeGuard = defineMiddleware(async (ctx, next) => {
	const { pathname } = ctx.url;
	const firstSegment = pathname.split("/")[1] ?? "";

	const isRoot = pathname === "/" || firstSegment === "";
	const looksLikeFile = firstSegment.includes(".");

	if (
		!isRoot &&
		!looksLikeFile &&
		!NON_LOCALE_ROOTS.includes(firstSegment) &&
		!isLocale(firstSegment)
	) {
		const response = await ctx.rewrite("/404");
		return new Response(response.body, {
			status: 404,
			headers: response.headers,
		});
	}

	return next();
});

// Las cabeceras de seguridad van en TODA respuesta, incluida la 404 y /api/*.
const securityHeaders = defineMiddleware(async (ctx, next) => {
	const handled = (await localeGuard(ctx, next)) as Response;
	return withSecurityHeaders(handled);
});

export const onRequest = securityHeaders;
