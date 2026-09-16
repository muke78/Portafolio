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

const withNoStore = (response: Response): Response => {
	response.headers.set("Cache-Control", "no-store, must-revalidate");
	return response;
};

const adminGuard = defineMiddleware(async (ctx, next) => {
	const { pathname } = ctx.url;

	const isAdminPath = pathname.startsWith("/admin");
	const isAdminApiPath = pathname.startsWith("/api/admin");

	if (!isAdminPath && !isAdminApiPath) return next();

	// Every response under /admin* and /api/admin* - login included - gets
	// Cache-Control: no-store. Without it a browser can restore a stale
	// authenticated admin page straight from its back-forward cache after
	// logout, purely via history navigation ("back" button), without ever
	// re-hitting the server to re-check the session (observed live: going
	// back worked even before logging out - no fresh request fired at
	// all). The real fix is a server-backed session store replacing the
	// in-memory one (docs/TODO.md section 5.3, considerations/03-sessions.md -
	// not done yet); this header is the cheap, immediate mitigation that
	// doesn't depend on that larger rework landing first.
	const isLoginRoute = isAdminPath
		? pathname.startsWith("/admin/login")
		: pathname.startsWith("/api/admin/login");

	if (isLoginRoute) return withNoStore(await next());

	const token = ctx.cookies.get(SESSION_COOKIE)?.value;
	const ok = verifySessionToken(token, ADMIN_SESSION_SECRET);

	if (ok) return withNoStore(await next());

	if (isAdminApiPath) {
		return withNoStore(
			new Response(JSON.stringify({ message: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			}),
		);
	}

	return withNoStore(ctx.redirect("/admin/login"));
});

export const onRequest = sequence(localeGuard, adminGuard);
