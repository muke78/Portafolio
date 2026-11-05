import { VITE_API_URL } from "astro:env/client";
import { API_SECRET_TOKEN } from "astro:env/server";

/**
 * Cliente unico del Backend_Portafolio. SOLO se importa desde codigo de
 * servidor (rutas /api/* y paginas SSR): agrega el bearer, y el navegador
 * nunca lo ve. tests/unit/security/hygiene.test.ts lo hace cumplir.
 *
 * Usa `fetch` (nativo en Workers) en lugar de axios: un error de axios trae la
 * configuracion de la peticion, incluida la cabecera `Authorization`, y acababa
 * en los logs con una sola linea descuidada. Aqui el error lleva solo el
 * estado HTTP; nunca el cuerpo ni las cabeceras del backend.
 *
 * Mismas reglas que `src/server/backendClient.ts` del Portafolio_Admin.
 */
export class ApiError extends Error {
	constructor(readonly status: number) {
		super(`El backend respondio ${status}`);
		this.name = "ApiError";
	}
}

const TIMEOUT_MS = 10_000;

/** `/projects?x=1` -> `<VITE_API_URL>/projects?x=1`. Rechaza rutas que escapen de la base. */
export const buildApiUrl = (path: string, base = VITE_API_URL): string => {
	if (!path.startsWith("/") || path.startsWith("//")) {
		throw new Error("La ruta del backend debe empezar con una sola /");
	}
	// Solo la ruta: un `..` dentro de un valor de la consulta no es un segmento.
	const pathname = path.split("?")[0];
	if (pathname.split("/").some((segment) => segment === "..")) {
		throw new Error("La ruta del backend no puede contener ..");
	}
	return `${base.replace(/\/+$/, "")}${path}`;
};

/** Direcciones IPv4 o IPv6 en texto; cualquier otra cosa no se manda al backend. */
const IP_FORMAT = /^[0-9a-fA-F:.]{3,45}$/;

const request = async <T>(
	path: string,
	method: "GET" | "POST",
	body?: unknown,
	timeoutMs = TIMEOUT_MS,
	visitorIp?: string,
): Promise<{ data: T }> => {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${API_SECRET_TOKEN}`,
		Accept: "application/json",
	};
	if (body !== undefined) headers["Content-Type"] = "application/json";
	// El backend limita por visitante, no por este Worker: sin esta cabecera todos
	// los visitantes compartirian el mismo cupo.
	if (visitorIp && IP_FORMAT.test(visitorIp))
		headers["X-Visitor-IP"] = visitorIp;

	const response = await fetch(buildApiUrl(path), {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
		signal: AbortSignal.timeout(timeoutMs),
	});
	if (!response.ok) throw new ApiError(response.status);
	// Una respuesta sin cuerpo (204) es valida: no debe contar como fallo.
	const text = await response.text();
	return { data: (text ? JSON.parse(text) : undefined) as T };
};

export const api = {
	/** `timeoutMs` es para lo que no debe frenar una pagina (datos con respaldo). */
	get: <T = unknown>(path: string, options: { timeoutMs?: number } = {}) =>
		request<T>(path, "GET", undefined, options.timeoutMs),
	/** `visitorIp` es la IP real de quien envia el formulario (para el limite del backend). */
	post: <T = unknown>(
		path: string,
		body: unknown,
		options: { visitorIp?: string } = {},
	) => request<T>(path, "POST", body, TIMEOUT_MS, options.visitorIp),
};
