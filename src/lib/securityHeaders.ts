/**
 * Cabeceras de seguridad que el sitio manda en TODAS sus respuestas.
 *
 * Las respuestas dinamicas (paginas SSR y /api/*) las recibe del middleware;
 * los archivos estaticos (imagenes, favicon, JS/CSS del build) las reciben de
 * `public/_headers`. Una prueba compara ambas listas para que no se separen.
 *
 * El CSP de aqui es el MINIMO (marcos, `<base>`, plugins, formularios) y vale para
 * lo que no es una pagina: la API y los archivos estaticos. Las paginas SSR llevan el
 * CSP completo, con hashes, que genera Astro (`security.csp` en astro.config.mjs) y
 * que ya incluye esas mismas cuatro directivas; ver docs/SECURITY.md.
 */
export const SECURITY_HEADERS = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy":
		"camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
	"Cross-Origin-Opener-Policy": "same-origin",
	"Content-Security-Policy":
		"base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
} as const;

/**
 * Devuelve la respuesta con las cabeceras puestas. Una cabecera que la ruta ya
 * definio se respeta. Si las cabeceras de la respuesta son inmutables (las de
 * un `fetch` lo son), se copia la respuesta en lugar de fallar.
 */
export const withSecurityHeaders = (response: Response): Response => {
	const apply = (target: Response) => {
		for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
			if (!target.headers.has(name)) target.headers.set(name, value);
		}
		return target;
	};
	try {
		return apply(response);
	} catch {
		return apply(
			new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			}),
		);
	}
};
