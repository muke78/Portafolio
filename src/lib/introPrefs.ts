/**
 * Preferencia de la introduccion («el origen del universo»), guardada en el navegador.
 *
 *   sin valor  primera visita: se muestra la puerta (el punto cero) hasta que la persona
 *              responda la pregunta del pie de pagina
 *   "replay"   quiere volver a verla desde el principio en cada visita
 *   "skip"     entra directo al sitio, con las estrellas ya esparcidas
 *
 * La clave es la misma que lee el script en linea del <head> (INTRO_GATE_SCRIPT en
 * src/lib/inlineScripts.ts, que corre antes del primer pintado). Todo acceso va en
 * try/catch: el almacenamiento puede estar bloqueado (modo privado, politicas).
 */
export const INTRO_KEY = "intro";
/** La puerta ya se abrio en esta pestana: volver de un proyecto o cambiar de idioma no la repite. */
export const INTRO_SEEN_KEY = "intro-seen";
/** Una sola vez, en esta pestana: «Volver a ver el origen» del pie, sin tocar la preferencia. */
export const INTRO_ONCE_KEY = "intro-once";

export type IntroPref = "replay" | "skip";

export const readIntroPref = (): IntroPref | null => {
	try {
		const value = localStorage.getItem(INTRO_KEY);
		return value === "replay" || value === "skip" ? value : null;
	} catch {
		return null;
	}
};

export const writeIntroPref = (pref: IntroPref): boolean => {
	try {
		localStorage.setItem(INTRO_KEY, pref);
		return true;
	} catch {
		return false;
	}
};

/** Pide la puerta una vez (la lee y la borra el script del <head> en la siguiente carga). */
export const requestIntroOnce = (): boolean => {
	try {
		sessionStorage.setItem(INTRO_ONCE_KEY, "1");
		return true;
	} catch {
		return false;
	}
};

/** Anota que la puerta ya se abrio en esta pestana (una recarga si la vuelve a mostrar). */
export const markIntroSeen = (): boolean => {
	try {
		sessionStorage.setItem(INTRO_SEEN_KEY, "1");
		return true;
	} catch {
		return false;
	}
};
