import { ADMIN_SESSION_SECRET, API_SECRET_TOKEN } from "astro:env/server";
import type { APIContext, APIRoute } from "astro";
import { isAxiosError } from "axios";
import { getHonoJwt, SESSION_COOKIE } from "@/lib/adminSession";
import { api } from "@/lib/api";

// Resource keys the admin dashboard knows about, mapped 1:1 to Hono's own
// route segments (Backend_Portafolio src/index.ts app.route(...) calls) -
// no separate name-mapping table to keep in sync. "comments" here always
// means the ADMIN view (all statuses, GET /comments/admin) - see
// honoGetPath below, not the public-only GET /comments the site itself
// reads via src/pages/api/[resource].ts.
const ALLOWED = new Set([
	"projects",
	"experiences",
	"education",
	"skills",
	"about",
	"comments",
	"contact-messages",
]);

// about is a singleton (Backend_Portafolio schemas/about.ts) - PUT /about
// has no :id segment, there's nothing to "list" or "create another of".
const SINGLETON = new Set(["about"]);

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

const honoGetPath = (resource: string): string =>
	resource === "comments" ? "comments/admin" : resource;

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

// Surface the real upstream status/message (401 vs 404 vs 400) instead of
// a blanket 503 - the moderation UI needs to tell "not found" apart from
// "your session expired" apart from "backend is down".
const upstreamError = (err: unknown, fallback: string) => {
	if (isAxiosError(err) && err.response) {
		return json(
			err.response.data ?? { message: fallback },
			err.response.status,
		);
	}
	return json({ message: fallback }, 503);
};

export const GET: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	if (!resource) return json({ message: "resource invalid" }, 400);

	// Attached whenever present, harmless on routes that don't need it
	// (public GETs never read this header) - required for "comments/admin"
	// and "contact-messages", both adminAuth-gated on the Hono side.
	const jwt = getHonoJwt(
		cookies.get(SESSION_COOKIE)?.value,
		ADMIN_SESSION_SECRET,
	);
	const headers: Record<string, string> = {
		Authorization: `Bearer ${API_SECRET_TOKEN}`,
	};
	if (jwt) headers["X-Admin-JWT"] = `Bearer ${jwt}`;

	try {
		const { data } = await api.get(
			`/${honoGetPath(resource)}${localeQuery(url)}`,
			{ headers },
		);
		return json(data);
	} catch (err) {
		return upstreamError(err, `No se pudo obtener ${resource}`);
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
	} catch (err) {
		return upstreamError(err, "create failed");
	}
};

export const PUT: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	if (!resource) return json({ message: "resource invalid" }, 400);
	const id = url.searchParams.get("id");
	if (!id && !SINGLETON.has(resource)) {
		return json({ message: "params invalid" }, 400);
	}
	const headers = adminWriteHeaders(cookies);
	if (!headers) return json({ message: "Unauthorized" }, 401);
	const path = SINGLETON.has(resource) ? resource : `${resource}/${id}`;
	try {
		const body = await request.json();
		const { data } = await api.put(`/${path}${localeQuery(url)}`, body, {
			headers,
		});
		return json(data);
	} catch (err) {
		return upstreamError(err, "update failed");
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
	} catch (err) {
		return upstreamError(err, "delete failed");
	}
};
