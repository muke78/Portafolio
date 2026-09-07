import { API_SECRET_TOKEN } from "astro:env/server";
import type { APIRoute } from "astro";
import { api } from "@/lib/api";

const ALLOWED = new Set(["projects", "experiences", "comments"]);

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

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	if (!resource) return json({ message: "resource invalid" }, 400);

	const locale = url.searchParams.get("currentLocale");
	const qs = locale ? `?currentLocale=${locale}` : "";
	try {
		const { data } = await api.get(`/${resource}${qs}`, {
			headers: { Authorization: `Bearer ${API_SECRET_TOKEN}` },
		});
		return json(data);
	} catch {
		return json({ message: "fetch failed" }, 503);
	}
};

export const POST: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	if (!resource) return json({ message: "resource invalid" }, 400);
	try {
		const body = await request.json();
		const { data } = await api.post(`/${resource}`, body, {
			headers: { Authorization: `Bearer ${API_SECRET_TOKEN}` },
		});
		return json(data, 201);
	} catch {
		return json({ message: "create failed" }, 503);
	}
};

export const PUT: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	const id = url.searchParams.get("id");
	if (!resource || !id) return json({ message: "params invalid" }, 400);
	try {
		const body = await request.json();
		const { data } = await api.put(`/${resource}/${id}`, body, {
			headers: { Authorization: `Bearer ${API_SECRET_TOKEN}` },
		});
		return json(data);
	} catch {
		return json({ message: "update failed" }, 503);
	}
};

export const DELETE: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const resource = resolveResource(url);
	const id = url.searchParams.get("id");
	if (!resource || !id) return json({ message: "params invalid" }, 400);
	try {
		const { data } = await api.delete(`/${resource}/${id}`, {
			headers: { Authorization: `Bearer ${API_SECRET_TOKEN}` },
		});
		return json(data);
	} catch {
		return json({ message: "delete failed" }, 503);
	}
};
