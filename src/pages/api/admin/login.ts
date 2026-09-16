import { ADMIN_SESSION_SECRET, API_SECRET_TOKEN } from "astro:env/server";
import type { APIRoute } from "astro";
import {
	buildSessionToken,
	SESSION_COOKIE,
	SESSION_MAX_AGE,
} from "@/lib/adminSession";
import { api } from "@/lib/api";
import { isRateLimited } from "@/lib/rateLimit";
import { adminLoginSchema } from "@/schemas/adminLoginSchema";

const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 5 * 60 * 1000 };

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
	try {
		let ip = "unknown";
		try {
			ip = clientAddress;
		} catch {
			// clientAddress throws in some adapters/environments (e.g. static
			// preview) - fall back to a shared bucket rather than failing.
		}
		if (isRateLimited(`login:${ip}`, LOGIN_RATE_LIMIT)) {
			return new Response(
				JSON.stringify({ message: "Too many attempts, try again later" }),
				{ status: 429, headers: { "Content-Type": "application/json" } },
			);
		}

		const body = await request.json();
		const parsed = adminLoginSchema.safeParse(body);
		if (!parsed.success) {
			return new Response(
				JSON.stringify({
					message: parsed.error.issues[0]?.message ?? "Datos inválidos",
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } },
			);
		}
		const { email, password } = parsed.data;

		// The real check happens in Hono, the only side with access to
		// Turso's users table / the Argon2id hash (docs/03-hono-admin-auth.md
		// in Backend_Portafolio). Astro never sees or stores the password.
		let honoJwt: string;
		try {
			const { data } = await api.post(
				"/auth/login",
				{ email, password },
				{ headers: { Authorization: `Bearer ${API_SECRET_TOKEN}` } },
			);
			honoJwt = data?.data?.token;
			if (!honoJwt) throw new Error("missing token");
		} catch {
			return new Response(JSON.stringify({ message: "Invalid credentials" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const token = buildSessionToken(ADMIN_SESSION_SECRET, honoJwt);
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
