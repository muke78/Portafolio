import { defineMiddleware } from "astro:middleware";
import { ADMIN_SESSION_SECRET } from "astro:env/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/adminSession";

export const onRequest = defineMiddleware(async (ctx, next) => {
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
