import type { APIRoute } from "astro";
import { ICON_NAME } from "@/lib/techIcon";

/**
 * Iconos de tecnologias (go-skill-icons, licencia MIT) servidos desde el propio sitio.
 * Asi el visitante no le manda su IP ni su navegador a un tercero, el CSP no necesita
 * ese origen y el borde de Cloudflare guarda cada icono 30 dias: si el servicio se
 * cae, los ya vistos siguen saliendo.
 */
const UPSTREAM = "https://go-skill-icons.vercel.app/api/icons";
const MAX_BYTES = 200 * 1024;
const EDGE_TTL = 30 * 24 * 60 * 60;

const empty = (status: number) =>
	new Response(null, {
		status,
		headers: { "Cache-Control": "public, max-age=60" },
	});

export const GET: APIRoute = async ({ params }) => {
	const name = (params.name ?? "").toLowerCase();
	if (!ICON_NAME.test(name)) return empty(404);

	let upstream: Response;
	try {
		upstream = await fetch(`${UPSTREAM}?i=${encodeURIComponent(name)}`, {
			signal: AbortSignal.timeout(5000),
			cf: { cacheTtl: EDGE_TTL, cacheEverything: true },
		} as RequestInit);
	} catch {
		return empty(502);
	}
	if (!upstream.ok) return empty(upstream.status === 404 ? 404 : 502);

	// Solo SVG: lo demas no es un icono y no se reenvia.
	const type = (upstream.headers.get("content-type") ?? "").toLowerCase();
	if (!type.startsWith("image/svg+xml")) return empty(502);

	const svg = await upstream.text();
	if (svg.length > MAX_BYTES) return empty(502);

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": `public, max-age=86400, s-maxage=${EDGE_TTL}`,
			// El SVG es de un tercero: abierto directo no puede ejecutar nada.
			"Content-Security-Policy":
				"default-src 'none'; style-src 'unsafe-inline'; sandbox",
			"X-Content-Type-Options": "nosniff",
		},
	});
};
