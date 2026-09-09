import { timingSafeEqual } from "node:crypto";
import { ADMIN_PASSWORD, ADMIN_SESSION_SECRET } from "astro:env/server";
import type { APIRoute } from "astro";
import {
	SESSION_COOKIE,
	SESSION_MAX_AGE,
	buildSessionToken,
} from "@/lib/adminSession";
import { isRateLimited } from "@/lib/rateLimit";

const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 5 * 60 * 1000 };

const passwordMatches = (candidate: string, expected: string): boolean => {
	const a = Buffer.from(candidate);
	const b = Buffer.from(expected);
	// timingSafeEqual throws on mismatched lengths rather than just
	// returning false - length itself isn't the secret being protected,
	// so it's fine to check and short-circuit on it before the
	// constant-time comparison of the actual bytes.
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
};

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
		const password: string | undefined = body?.password;

		if (!password || !passwordMatches(password, ADMIN_PASSWORD)) {
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
