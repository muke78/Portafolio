import type { APIRoute } from "astro";
import { SESSION_COOKIE, revokeSessionToken } from "@/lib/adminSession";

export const POST: APIRoute = async ({ cookies }) => {
	revokeSessionToken(cookies.get(SESSION_COOKIE)?.value);
	cookies.delete(SESSION_COOKIE, { path: "/" });
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
