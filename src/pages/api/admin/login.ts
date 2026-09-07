import { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } from "astro:env/server";
import type { APIRoute } from "astro";
import {
	SESSION_COOKIE,
	SESSION_MAX_AGE,
	buildSessionToken,
} from "@/lib/adminSession";

export const POST: APIRoute = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const password: string | undefined = body?.password;

		if (!password || password !== ADMIN_PASSWORD) {
			return new Response(JSON.stringify({ message: "Invalid credentials" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const token = buildSessionToken(ADMIN_SESSION_SECRET);
		cookies.set(SESSION_COOKIE, token, {
			httpOnly: true,
			secure: true,
			sameSite: "lax",
			path: "/",
			maxAge: SESSION_MAX_AGE,
		});

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch {
		return new Response(JSON.stringify({ message: "Bad request" }), {
			status: 400,
			headers: { "Content-Type": "application/json" },
		});
	}
};
