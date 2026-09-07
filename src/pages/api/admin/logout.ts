import type { APIRoute } from "astro";
import { SESSION_COOKIE } from "@/lib/adminSession";

export const POST: APIRoute = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE, { path: "/" });
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
