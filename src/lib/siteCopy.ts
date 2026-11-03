import { api } from "@/lib/api";
import { type SiteCopy, siteCopySchema } from "@/schemas/siteCopySchema";

/**
 * Textos del sitio que se editan desde el CMS (foto y presentacion del hero, frase
 * del manifiesto, descripcion para buscadores), ya en el idioma de la pagina. Solo
 * se importa desde codigo de servidor (paginas y secciones .astro).
 *
 * Es OPCIONAL: si el backend no responde a tiempo, aun no hay ficha o devuelve algo
 * que no pasa el esquema, se usa el ultimo valor bueno de ese idioma y, si no hay,
 * `null`: quien lo llama cae a los archivos de idioma y a la foto estatica del repo,
 * asi que el sitio nunca se rompe por una falla del backend.
 */
export const SITE_COPY_TTL_MS = 60_000;
/** Mas que esto, la pagina no espera: usa el respaldo y reintenta en la siguiente. */
export const SITE_COPY_TIMEOUT_MS = 2_000;

const cache = new Map<string, { value: SiteCopy; at: number }>();
const inflight = new Map<string, Promise<SiteCopy | null>>();

const fetchCopy = async (locale: string): Promise<SiteCopy | null> => {
	try {
		const { data } = await api.get<{ data?: unknown }>(
			`/site-copy?currentLocale=${encodeURIComponent(locale)}`,
			{ timeoutMs: SITE_COPY_TIMEOUT_MS },
		);
		const parsed = siteCopySchema.safeParse(data?.data);
		if (!parsed.success) throw new Error("textos del sitio no validos");
		cache.set(locale, { value: parsed.data, at: Date.now() });
		return parsed.data;
	} catch {
		// Sin detalle hacia fuera: ni el cuerpo ni las cabeceras del backend.
		return cache.get(locale)?.value ?? null;
	}
};

/** Una sola peticion por idioma y ventana, compartida por Header, Manifiesto y Layout. */
export const getSiteCopy = async (
	locale: string,
	now = Date.now(),
): Promise<SiteCopy | null> => {
	const hit = cache.get(locale);
	if (hit && now - hit.at < SITE_COPY_TTL_MS) return hit.value;
	const pending =
		inflight.get(locale) ??
		fetchCopy(locale).finally(() => inflight.delete(locale));
	inflight.set(locale, pending);
	return pending;
};

/** Solo para pruebas. */
export const resetSiteCopyCache = (): void => {
	cache.clear();
	inflight.clear();
};
