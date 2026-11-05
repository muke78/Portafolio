import { PUBLIC_TURNSTILE_SITE_KEY } from "astro:env/client";
import { useEffect, useRef } from "react";

/**
 * Casilla de Cloudflare Turnstile. Entrega un token de un solo uso que el servidor
 * valida con `siteverify` (src/lib/turnstile.ts). El script se baja al montar el
 * formulario, no al cargar la pagina.
 *
 * Sin `PUBLIC_TURNSTILE_SITE_KEY` (por ejemplo en `pnpm dev`) no pinta nada y el
 * formulario sigue funcionando; en produccion el servidor exige el token.
 */
const SCRIPT_SRC =
	"https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
	render: (
		container: HTMLElement,
		options: {
			sitekey: string;
			language: string;
			theme: "auto";
			appearance: "interaction-only";
			callback: (token: string) => void;
			"expired-callback": () => void;
			"error-callback": () => void;
		},
	) => string;
	reset: (widgetId: string) => void;
	remove: (widgetId: string) => void;
}

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

let loading: Promise<TurnstileApi> | null = null;

const loadTurnstile = (): Promise<TurnstileApi> => {
	if (window.turnstile) return Promise.resolve(window.turnstile);
	loading ??= new Promise<TurnstileApi>((resolve, reject) => {
		const script = document.createElement("script");
		script.src = SCRIPT_SRC;
		script.async = true;
		script.onload = () =>
			window.turnstile
				? resolve(window.turnstile)
				: reject(new Error("Turnstile no disponible"));
		script.onerror = () => {
			loading = null;
			reject(new Error("No se pudo cargar Turnstile"));
		};
		document.head.append(script);
	});
	return loading;
};

/** `true` si el sitio tiene Turnstile configurado (hay clave publica). */
export const turnstileEnabled = Boolean(PUBLIC_TURNSTILE_SITE_KEY);

interface Props {
	locale: string;
	/** Recibe el token, o `null` cuando vence o falla. */
	onToken: (token: string | null) => void;
	/** Cambia este numero para pedir un token nuevo (cada token sirve una sola vez). */
	resetKey?: number;
}

export const TurnstileWidget = ({ locale, onToken, resetKey = 0 }: Props) => {
	const container = useRef<HTMLDivElement>(null);
	const widgetId = useRef<string | null>(null);
	const onTokenRef = useRef(onToken);
	onTokenRef.current = onToken;

	useEffect(() => {
		if (!PUBLIC_TURNSTILE_SITE_KEY || !container.current) return;
		let cancelled = false;
		const target = container.current;

		loadTurnstile()
			.then((turnstile) => {
				if (cancelled) return;
				widgetId.current = turnstile.render(target, {
					sitekey: PUBLIC_TURNSTILE_SITE_KEY,
					language: locale,
					theme: "auto",
					appearance: "interaction-only",
					callback: (token) => onTokenRef.current(token),
					"expired-callback": () => onTokenRef.current(null),
					"error-callback": () => onTokenRef.current(null),
				});
			})
			.catch(() => onTokenRef.current(null));

		return () => {
			cancelled = true;
			if (widgetId.current) window.turnstile?.remove(widgetId.current);
			widgetId.current = null;
		};
	}, [locale]);

	useEffect(() => {
		if (resetKey > 0 && widgetId.current) {
			onTokenRef.current(null);
			window.turnstile?.reset(widgetId.current);
		}
	}, [resetKey]);

	if (!PUBLIC_TURNSTILE_SITE_KEY) return null;
	return <div ref={container} data-turnstile />;
};
