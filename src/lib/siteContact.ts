import { api } from "@/lib/api";
import {
	type SiteContact,
	siteContactSchema,
} from "@/schemas/siteContactSchema";

/**
 * Datos de contacto del sitio (GitHub, LinkedIn, telefono y correo). Viven en el
 * backend y se editan desde el CMS. Solo se importa desde codigo de servidor
 * (paginas y secciones .astro): el navegador los recibe ya resueltos, como props.
 *
 * Si el backend no responde a tiempo o devuelve algo que no pasa el esquema, se
 * usa el ultimo valor bueno y, si no hay, `FALLBACK_CONTACT`: el pie y el hero
 * nunca se quedan sin enlaces por una falla del backend.
 */
export const FALLBACK_CONTACT: SiteContact = {
	github_url: "https://github.com/muke78",
	linkedin_url:
		"https://www.linkedin.com/in/erick-miguel-gonz%C3%A1lez-rivera-96265b248/",
	linkedin_name: "Erick Miguel Gonzalez Rivera",
	phone: "+52 55 1190 9105",
	email: "erickm.gonzalez.rivera@gmail.com",
};

/** Un cambio hecho en el CMS se ve en el sitio en, como mucho, este tiempo. */
export const CONTACT_TTL_MS = 60_000;
/** Mas que esto, la pagina no espera: usa el respaldo y reintenta en la siguiente. */
export const CONTACT_TIMEOUT_MS = 2_000;

let cached: { value: SiteContact; at: number } | null = null;
let inflight: Promise<SiteContact> | null = null;

const fetchContact = async (): Promise<SiteContact> => {
	try {
		const { data } = await api.get<{ data: unknown }>("/contact-info", {
			timeoutMs: CONTACT_TIMEOUT_MS,
		});
		const parsed = siteContactSchema.safeParse(
			(data as { data?: unknown } | undefined)?.data,
		);
		if (!parsed.success) throw new Error("datos de contacto no validos");
		cached = { value: parsed.data, at: Date.now() };
		return parsed.data;
	} catch {
		// Sin detalle hacia fuera: ni el cuerpo ni las cabeceras del backend.
		return cached?.value ?? FALLBACK_CONTACT;
	}
};

/** Una sola peticion por ventana de tiempo, compartida por Header, pie, formulario y JSON-LD. */
export const getContact = async (now = Date.now()): Promise<SiteContact> => {
	if (cached && now - cached.at < CONTACT_TTL_MS) return cached.value;
	inflight ??= fetchContact().finally(() => {
		inflight = null;
	});
	return inflight;
};

/** Solo para pruebas. */
export const resetContactCache = (): void => {
	cached = null;
	inflight = null;
};
