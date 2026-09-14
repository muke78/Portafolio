import { ADMIN_SESSION_SECRET } from "astro:env/server";
import { defineMiddleware, sequence } from "astro:middleware";
import { isLocale } from "@/i18n/locales";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";

// Routes that intentionally live outside the /[lang]/* locale tree and
// must never be caught by the locale guard below. "404" has to be here
// too - ctx.rewrite("/404") re-enters this same middleware, and without
// the exemption it would rewrite to /404 forever ("Loop Detected").
// "_image" is Astro's own on-demand image transform endpoint
// (astro:assets <Image>/<Picture>) - without this exemption every
// optimized image 404s the moment a real one is used, since its request
// path doesn't look like a file and isn't a locale either.
const NON_LOCALE_ROOTS = ["admin", "api", "404", "_image"];

// i18n routing is set to "manual" in astro.config.mjs specifically so
// that /admin and /api/* aren't swallowed by Astro's automatic
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

const adminGuard = defineMiddleware(async (ctx, next) => {
	const { pathname } = ctx.url;

	const isAdmin =
		pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

	const isAdminApi =
		pathname.startsWith("/api/admin") &&
		!pathname.startsWith("/api/admin/login");

	if (!isAdmin && !isAdminApi) return next();

	const token = ctx.cookies.get(SESSION_COOKIE)?.value;
	const ok = verifySessionToken(token, ADMIN_SESSION_SECRET);

	if (ok) return next();

	if (isAdminApi) {
		return new Response(JSON.stringify({ message: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	return ctx.redirect("/admin/login");
});

export const onRequest = sequence(localeGuard, adminGuard);
