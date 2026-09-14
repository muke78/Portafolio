import { API_SECRET_TOKEN } from "astro:env/server";
import type { APIRoute } from "astro";
import { api } from "@/lib/api";
import { isRateLimited } from "@/lib/rateLimit";

// Reemplaza a /api/tlgrm (Telegram eliminado por completo del lado del
// backend - ver Backend_Portafolio, docs/02-comentarios-y-contacto.md).
// El mensaje ahora queda en Turso (tabla contact_messages), visible desde
// el admin/dashboard, no depende de un servicio externo para "existir".
const RATE_LIMIT = { limit: 5, windowMs: 60 * 1000 };

export const POST: APIRoute = async ({ request, clientAddress }) => {
	let ip = "unknown";
	try {
		ip = clientAddress;
	} catch {
		// clientAddress throws en algunos adapters/entornos (ej. preview
		// estatico) - cae a un bucket compartido en vez de fallar.
	}
	if (isRateLimited(`contact-messages:${ip}`, RATE_LIMIT)) {
		return new Response(
			JSON.stringify({ message: "Too many requests, try again later" }),
			{ status: 429, headers: { "Content-Type": "application/json" } },
		);
	}

	try {
		const body = await request.json();

		// Hono espera snake_case (more_information) - el form del cliente
		// sigue mandando camelCase (moreInformation), sin tocarlo, este
		// endpoint es el limite de traduccion (mismo rol que ya cumplia
		// tlgrm.ts).
		await api.post(
			"/contact-messages",
			{
				name: body.name,
				email: body.email,
				phone: body.phone,
				more_information: body.moreInformation,
			},
			{
				headers: {
					Authorization: `Bearer ${API_SECRET_TOKEN}`,
				},
			},
		);

		return new Response(
			JSON.stringify({
				message: {
					name: body.name,
					email: body.email,
					phone: body.phone,
					moreInformation: body.moreInformation,
				},
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } },
		);
	} catch {
		return new Response(
			JSON.stringify({ message: "No se pudo enviar la información." }),
			{ status: 503, headers: { "Content-Type": "application/json" } },
		);
	}
};
