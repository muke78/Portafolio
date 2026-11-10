import { TURNSTILE_SECRET_KEY } from "astro:env/server";

/**
 * Verificacion de Cloudflare Turnstile en el servidor. El widget del navegador solo
 * entrega un token; quien decide es `siteverify`, con la clave secreta. Solo se
 * importa desde codigo de servidor (rutas /api/*).
 *
 * Falla CERRADO: sin clave secreta en produccion no se acepta nada (503). El unico
 * atajo es `pnpm dev`, donde no hay widget real.
 */
export const VERIFY_URL =
	"https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Un token real mide unos cientos de caracteres; el tope evita reenviar basura. */
const MAX_TOKEN_LENGTH = 2048;

export type TurnstileResult = "ok" | "failed" | "unavailable";

/** Separa `turnstileToken` del resto del cuerpo, que sigue su camino al esquema. */
export const splitTurnstileToken = (
	value: unknown,
): { token: unknown; rest: unknown } => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return { token: undefined, rest: value };
	}
	const { turnstileToken, ...rest } = value as Record<string, unknown>;
	return { token: turnstileToken, rest };
};

/** Respuesta de las rutas cuando la verificacion no pasa (generica, sin detalle). */
export const turnstileFailure = (result: Exclude<TurnstileResult, "ok">) =>
	new Response(
		JSON.stringify({
			message:
				result === "failed"
					? "Verification failed"
					: "Verification unavailable",
		}),
		{
			status: result === "failed" ? 403 : 503,
			headers: { "Content-Type": "application/json" },
		},
	);

interface Options {
	secret?: string;
	dev?: boolean;
	fetcher?: typeof fetch;
	/** Sitio donde se resolvio el reto (el de la peticion). Si se da, `siteverify` debe coincidir. */
	hostname?: string;
	/** Nombre del formulario (`comment`, `contact`). Si se da, `siteverify` debe coincidir. */
	action?: string;
}

export const verifyTurnstile = async (
	token: unknown,
	ip?: string,
	{
		secret = TURNSTILE_SECRET_KEY,
		dev = import.meta.env.DEV,
		fetcher = fetch,
		hostname,
		action,
	}: Options = {},
): Promise<TurnstileResult> => {
	if (!secret) return dev ? "ok" : "unavailable";
	if (
		typeof token !== "string" ||
		token === "" ||
		token.length > MAX_TOKEN_LENGTH
	) {
		return "failed";
	}

	const form = new URLSearchParams({ secret, response: token });
	if (ip && ip !== "unknown") form.set("remoteip", ip);

	try {
		const response = await fetcher(VERIFY_URL, {
			method: "POST",
			body: form,
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) return "unavailable";
		const result = (await response.json()) as {
			success?: unknown;
			hostname?: unknown;
			action?: unknown;
		};
		if (result.success !== true) return "failed";
		// Un token resuelto en otro sitio o para otro formulario no vale aqui, aunque
		// sea valido para Cloudflare (la misma clave de sitio sirve a ambos formularios).
		if (
			hostname !== undefined &&
			(typeof result.hostname !== "string" ||
				result.hostname.toLowerCase() !== hostname.toLowerCase())
		) {
			return "failed";
		}
		if (action !== undefined && result.action !== action) return "failed";
		return "ok";
	} catch {
		return "unavailable";
	}
};
