/**
 * Guardias de las rutas públicas de escritura (/api/comments y
 * /api/contact-messages). Son POST sin sesión que cualquiera puede llamar, así
 * que cada una de estas comprobaciones corta un vector distinto antes de gastar
 * una llamada al backend.
 */

/** Tope del cuerpo: los dos formularios son JSON de pocos cientos de bytes. */
export const MAX_BODY_BYTES = 10 * 1024;

type Guard<T> =
	| { ok: true; value: T }
	| { ok: false; status: number; message: string };

/**
 * Rechaza peticiones que vienen de otro sitio. Un navegador siempre manda
 * `Origin` en un POST; el `Sec-Fetch-Site` cubre clientes que no lo mandan.
 * Sin ninguna de las dos cabeceras (curl, pruebas, otro servidor) no hay
 * contexto de navegador del que protegerse, y el límite de peticiones y la
 * validación siguen aplicando.
 */
export const isSameOrigin = (request: Request, siteOrigin: string): boolean => {
	const origin = request.headers.get("origin");
	if (origin !== null) return origin === siteOrigin;
	const fetchSite = request.headers.get("sec-fetch-site");
	return (
		fetchSite === null || fetchSite === "same-origin" || fetchSite === "none"
	);
};

/**
 * Lee el cuerpo como JSON con tope de tamaño. Exige `Content-Type:
 * application/json`: un formulario HTML de otro sitio solo puede mandar
 * `text/plain` o `x-www-form-urlencoded` sin pasar por CORS, así que esto
 * también cierra el CSRF aunque `Origin` no viniera.
 */
export const readJsonBody = async (
	request: Request,
	maxBytes = MAX_BODY_BYTES,
): Promise<Guard<unknown>> => {
	const type = request.headers.get("content-type") ?? "";
	if (!/^application\/json(\s*;|$)/i.test(type)) {
		return {
			ok: false,
			status: 415,
			message: "Content-Type must be application/json",
		};
	}

	const declared = Number(request.headers.get("content-length") ?? 0);
	if (Number.isFinite(declared) && declared > maxBytes) {
		return { ok: false, status: 413, message: "Payload too large" };
	}

	let text: string;
	try {
		text = await request.text();
	} catch {
		return { ok: false, status: 400, message: "Invalid body" };
	}
	// `content-length` se puede omitir o mentir: se vuelve a medir el texto real.
	if (new TextEncoder().encode(text).length > maxBytes) {
		return { ok: false, status: 413, message: "Payload too large" };
	}

	try {
		return { ok: true, value: JSON.parse(text) };
	} catch {
		return { ok: false, status: 400, message: "Invalid JSON" };
	}
};
