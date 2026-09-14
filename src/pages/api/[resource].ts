import { API_SECRET_TOKEN } from "astro:env/server";
import type { APIRoute } from "astro";
import { api } from "@/lib/api";
import { isRateLimited } from "@/lib/rateLimit";

const READABLE = new Set(["projects", "experiences", "comments"]);
const WRITABLE_PUBLIC = new Set(["comments"]);

// Vector real del hackeo de 800 comentarios: este POST es publico, sin
// auth de usuario (cualquier visitante puede dejar un comentario), y
// hasta ahora no tenia techo de volumen aqui - src/lib/rateLimit.ts ya
// protegia el login admin, nunca se conecto a este endpoint. Hono mismo
// ya tiene su propio rate limit (ver Backend_Portafolio,
// docs/00-auditoria.md hallazgo 1/6), pero esta es la puerta que el
// publico real usa, hay que frenarlo aqui tambien.
const WRITE_RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

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

export const POST: APIRoute = async ({ params, request, clientAddress }) => {
	const resource = params.resource;
	if (!resource || !WRITABLE_PUBLIC.has(resource)) {
		return json({ message: "Method not allowed" }, 405);
	}

	let ip = "unknown";
	try {
		ip = clientAddress;
	} catch {
		// clientAddress throws en algunos adapters/entornos (ej. preview
		// estatico) - cae a un bucket compartido en vez de fallar.
	}
	if (isRateLimited(`${resource}:${ip}`, WRITE_RATE_LIMIT)) {
		return json({ message: "Too many requests, try again later" }, 429);
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
