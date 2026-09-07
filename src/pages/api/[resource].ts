import { API_SECRET_TOKEN } from "astro:env/server";
import type { APIRoute } from "astro";
import { api } from "@/lib/api";

const READABLE = new Set(["projects", "experiences", "comments"]);
const WRITABLE_PUBLIC = new Set(["comments"]);

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

const authHeaders = () => ({
	Authorization: `Bearer ${API_SECRET_TOKEN}`,
});

export const GET: APIRoute = async ({ params, url }) => {
	const resource = params.resource;
	if (!resource || !READABLE.has(resource)) {
		return json({ message: "Resource not found" }, 404);
	}
	const locale = url.searchParams.get("currentLocale");
	const qs = locale ? `?currentLocale=${locale}` : "";
	try {
		const { data } = await api.get(`/${resource}${qs}`, {
			headers: authHeaders(),
		});
		return json(data);
	} catch {
		return json({ message: `No se pudo obtener ${resource}` }, 503);
	}
};

export const POST: APIRoute = async ({ params, request }) => {
	const resource = params.resource;
	if (!resource || !WRITABLE_PUBLIC.has(resource)) {
		return json({ message: "Method not allowed" }, 405);
	}
	try {
		const body = await request.json();
		const { data } = await api.post(`/${resource}`, body, {
			headers: authHeaders(),
		});
		return json(data, 201);
	} catch {
		return json({ message: `No se pudo crear ${resource}` }, 503);
	}
};
