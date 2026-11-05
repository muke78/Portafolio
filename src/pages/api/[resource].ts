import type { APIRoute } from "astro";
import { api } from "@/lib/api";
import { checkRateLimit } from "@/lib/rateLimit";
import { isSameOrigin, readJsonBody } from "@/lib/requestGuards";
import {
	splitTurnstileToken,
	turnstileFailure,
	verifyTurnstile,
} from "@/lib/turnstile";
import { opinionsSchema } from "@/schemas/opinionsSchema";

const READABLE = new Set([
	"projects",
	"experiences",
	"comments",
	"about",
	"education",
	"skills",
]);
const WRITABLE_PUBLIC = new Set(["comments"]);

// Vector real del hackeo de 800 comentarios: este POST es publico, sin
// auth de usuario (cualquier visitante puede dejar un comentario), y
// hasta ahora no tenia techo de volumen aqui - src/lib/rateLimit.ts es el
// limitador en memoria que ya usa /api/contact-messages. Hono mismo
// ya tiene su propio rate limit (ver Backend_Portafolio,
// docs/00-auditoria.md hallazgo 1/6), pero esta es la puerta que el
// publico real usa, hay que frenarlo aqui tambien.
const WRITE_RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

export const GET: APIRoute = async ({ params, url }) => {
	const resource = params.resource;
	if (!resource || !READABLE.has(resource)) {
		return json({ message: "Resource not found" }, 404);
	}
	const locale = url.searchParams.get("currentLocale");
	// Se codifica: sin esto, `?currentLocale=es%26x%3D1` colaba parametros
	// propios en la consulta que se manda al backend.
	const qs = locale ? `?currentLocale=${encodeURIComponent(locale)}` : "";
	try {
		const { data } = await api.get(`/${resource}${qs}`);
		return json(data);
	} catch {
		return json({ message: `No se pudo obtener ${resource}` }, 503);
	}
};

export const POST: APIRoute = async (ctx) => {
	const { params, request, url } = ctx;
	const resource = params.resource;
	if (!resource || !WRITABLE_PUBLIC.has(resource)) {
		return json({ message: "Method not allowed" }, 405);
	}

	if (!isSameOrigin(request, url.origin)) {
		return json({ message: "Forbidden" }, 403);
	}

	let ip = "unknown";
	try {
		// Read it inside the try: on some adapters the getter itself throws, and
		// destructuring it in the signature would escape this fallback.
		ip = ctx.clientAddress;
	} catch {
		// clientAddress throws en algunos adapters/entornos (ej. preview
		// estatico) - cae a un bucket compartido en vez de fallar.
	}
	if (await checkRateLimit(`${resource}:${ip}`, WRITE_RATE_LIMIT)) {
		return json({ message: "Too many requests, try again later" }, 429);
	}

	const body = await readJsonBody(request);
	if (body.ok === false) return json({ message: body.message }, body.status);

	// Se valida aqui con el mismo esquema del formulario (el idioma solo afecta
	// a los textos de error) y SOLO se reenvian los campos conocidos: lo demas
	// que mande el cliente no llega al backend.
	const { token, rest } = splitTurnstileToken(body.value);
	const parsed = opinionsSchema({ currentLocale: "es" }).safeParse(rest);
	if (!parsed.success) return json({ message: "Invalid data" }, 400);

	const human = await verifyTurnstile(token, ip);
	if (human !== "ok") return turnstileFailure(human);

	try {
		const { data } = await api.post(`/${resource}`, parsed.data, {
			visitorIp: ip,
		});
		return json(data, 201);
	} catch {
		return json({ message: `No se pudo crear ${resource}` }, 503);
	}
};
