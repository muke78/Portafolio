import { ADMIN_SESSION_SECRET, API_SECRET_TOKEN } from "astro:env/server";
import type { APIContext, APIRoute } from "astro";
import { getHonoJwt, SESSION_COOKIE } from "@/lib/adminSession";
import { api } from "@/lib/api";

// "contact_messages" was missing here - GET worked (it isn't gated by
// this whitelist at all on the public [resource].ts proxy) but every
// admin write to the message inbox 400'd on "resource invalid".
const ALLOWED = new Set([
	"projects",
	"experiences",
	"comments",
	"contact_messages",
]);

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

const resolveResource = (url: URL): string | null => {
	const r = url.searchParams.get("resource");
	if (!r || !ALLOWED.has(r)) return null;
	return r;
};

// Writes are gated by the Hono JWT embedded in the admin session cookie
// (Fase 4c, docs/03-hono-admin-auth.md) - the static API_SECRET_TOKEN
// alone no longer proves "signed in as admin" to Hono's adminAuth
// middleware. hono/csrf also blocks any non-safe request with no
// Content-Type (even a bodyless DELETE), so that header is mandatory on
// every write here, not just where a body exists.
const adminWriteHeaders = (
	cookies: APIContext["cookies"],
): Record<string, string> | null => {
	const jwt = getHonoJwt(
		cookies.get(SESSION_COOKIE)?.value,
		ADMIN_SESSION_SECRET,
	);
	if (!jwt) return null;
	return {
		Authorization: `Bearer ${API_SECRET_TOKEN}`,
		"X-Admin-JWT": `Bearer ${jwt}`,
		"Content-Type": "application/json",
	};
};

// GET already forwarded ?currentLocale to the backend; POST/PUT/DELETE
// never did, so writes always landed against whatever the backend's own
// default locale is regardless of what the admin had selected. Forward
// it the same way (query param) on every operation now.
const localeQuery = (url: URL): string => {
	const locale = url.searchParams.get("currentLocale");
	return locale ? `?currentLocale=${locale}` : "";
};

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	if (!resource) return json({ message: "resource invalid" }, 400);

	try {
		const { data } = await api.get(`/${resource}${localeQuery(url)}`, {
			headers: { Authorization: `Bearer ${API_SECRET_TOKEN}` },
		});
		return json(data);
	} catch {
		return json({ message: "fetch failed" }, 503);
	}
};

export const POST: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	if (!resource) return json({ message: "resource invalid" }, 400);
	const headers = adminWriteHeaders(cookies);
	if (!headers) return json({ message: "Unauthorized" }, 401);
	try {
		const body = await request.json();
		const { data } = await api.post(`/${resource}${localeQuery(url)}`, body, {
			headers,
		});
		return json(data, 201);
	} catch {
		return json({ message: "create failed" }, 503);
	}
};

export const PUT: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	const id = url.searchParams.get("id");
	if (!resource || !id) return json({ message: "params invalid" }, 400);
	const headers = adminWriteHeaders(cookies);
	if (!headers) return json({ message: "Unauthorized" }, 401);
	try {
		const body = await request.json();
		const { data } = await api.put(
			`/${resource}/${id}${localeQuery(url)}`,
			body,
			{ headers },
		);
		return json(data);
	} catch {
		return json({ message: "update failed" }, 503);
	}
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	const id = url.searchParams.get("id");
	if (!resource || !id) return json({ message: "params invalid" }, 400);
	const headers = adminWriteHeaders(cookies);
	if (!headers) return json({ message: "Unauthorized" }, 401);
	try {
		const { data } = await api.delete(`/${resource}/${id}${localeQuery(url)}`, {
			headers,
		});
		return json(data);
	} catch {
		return json({ message: "delete failed" }, 503);
	}
};
