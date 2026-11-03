import type { APIRoute } from "astro";
import { api } from "@/lib/api";
import { isRateLimited } from "@/lib/rateLimit";
import { isSameOrigin, readJsonBody } from "@/lib/requestGuards";
import { contactSchema } from "@/schemas/contactSchema";

// Reemplaza a /api/tlgrm (Telegram eliminado por completo del lado del
// backend - ver Backend_Portafolio, docs/02-comentarios-y-contacto.md).
// El mensaje queda guardado en la tabla contact_messages de la base del
// backend y se lee desde el CMS; no depende de un servicio externo.
const RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

const json = (body: unknown, status: number) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

export const POST: APIRoute = async (ctx) => {
	const { request, url } = ctx;

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
	if (isRateLimited(`contact-messages:${ip}`, RATE_LIMIT)) {
		return json({ message: "Too many requests, try again later" }, 429);
	}

	const raw = await readJsonBody(request);
	if (raw.ok === false) return json({ message: raw.message }, raw.status);

	// Mismo esquema del formulario: lo que no cumple se corta aqui con 400 y
	// no llega al backend (antes un cuerpo `null` rompia el handler con 503).
	const parsed = contactSchema({ currentLocale: "es" }).safeParse(raw.value);
	if (!parsed.success) return json({ message: "Invalid data" }, 400);
	const body = parsed.data;

	try {
		// Hono espera snake_case (more_information) - el form del cliente
		// sigue mandando camelCase (moreInformation), sin tocarlo, este
		// endpoint es el limite de traduccion (mismo rol que ya cumplia
		// tlgrm.ts).
		await api.post("/contact-messages", {
			name: body.name,
			email: body.email,
			phone: body.phone,
			more_information: body.moreInformation || undefined,
		});

		return json(
			{
				message: {
					name: body.name,
					email: body.email,
					phone: body.phone,
					moreInformation: body.moreInformation,
				},
			},
			200,
		);
	} catch {
		return json({ message: "No se pudo enviar la información." }, 503);
	}
};
