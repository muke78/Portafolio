import { api } from "@/lib/api";
import type { Projects } from "@/types/currentLang.interface";

/**
 * Contenido de `/llms.txt` (llmstxt.org): un indice en Markdown para modelos de
 * lenguaje y agentes. Todo lo que viene del backend (titulos, resumenes, enlaces) es
 * texto que un tercero va a leer como instrucciones: se limpia antes de escribirlo
 * (una sola linea, sin corchetes que rompan un enlace, solo URLs https).
 */

/** Idioma del texto de los proyectos: el que mejor leen los agentes. */
export const LLMS_LOCALE = "en";
/** Mas que esto, el archivo sale sin proyectos y reintenta en la siguiente peticion. */
export const PROJECTS_TIMEOUT_MS = 2_000;
export const PROJECTS_TTL_MS = 5 * 60_000;

const MAX_SUMMARY = 220;

/** Una linea, sin corchetes ni caracteres de control; `max` caracteres como mucho. */
export const cleanText = (value: unknown, max = 160): string => {
	if (typeof value !== "string") return "";
	const flat = Array.from(value)
		.map((char) => {
			const code = char.codePointAt(0) ?? 0;
			return code < 32 || code === 127 ? " " : char;
		})
		.join("")
		.replace(/[[\]]/g, (b) => (b === "[" ? "(" : ")"))
		.replace(/\s+/g, " ")
		.trim();
	return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};

/** La URL tal como queda normalizada si es https, o `null`. */
export const httpsUrl = (value: unknown): string | null => {
	if (typeof value !== "string" || value.length > 500) return null;
	try {
		const url = new URL(value.trim());
		return url.protocol === "https:" ? url.href : null;
	} catch {
		return null;
	}
};

const CATEGORY_TITLES: Record<string, string> = {
	frontend: "Frontend projects",
	backend: "Backend projects",
	dataAnalyst: "Data analysis projects",
	companies:
		"Professional work (private company systems: described, no public links)",
};
const CATEGORY_ORDER = ["frontend", "backend", "dataAnalyst", "companies"];

export interface LlmsInput {
	origin: string;
	locales: readonly string[];
	defaultLocale: string;
	description: string;
	contact: { github_url: string; linkedin_url: string; email?: string };
	/** URL publica del PDF del curriculum, si hay uno cargado. */
	cvUrl: string | null;
	projects: readonly Projects[];
}

export const buildLlmsTxt = ({
	origin,
	locales,
	defaultLocale,
	description,
	contact,
	cvUrl,
	projects,
}: LlmsInput): string => {
	const lines: string[] = [
		"# Erick González (muke78)",
		"",
		`> ${cleanText(description, 400)}`,
		"",
		"## Pages",
		"",
		...locales.map((l) => `- [Home (${l})](${origin}/${l}/home)`),
		`- [Contact form](${origin}/${defaultLocale}/home#contact): the form lives on the home page`,
		"",
		"## Contact and profiles",
		"",
	];

	const github = httpsUrl(contact.github_url);
	const linkedin = httpsUrl(contact.linkedin_url);
	if (github) lines.push(`- [GitHub](${github})`);
	if (linkedin) lines.push(`- [LinkedIn](${linkedin})`);
	const email = cleanText(contact.email, 254);
	if (email) lines.push(`- Email: ${email}`);
	const cv = httpsUrl(cvUrl);
	if (cv) lines.push(`- [Résumé / CV (PDF)](${cv})`);
	lines.push("");

	const groups = CATEGORY_ORDER.map((category) => ({
		category,
		items: projects.filter((p) => p.category === category),
	})).filter((g) => g.items.length > 0);

	if (groups.length > 0) {
		lines.push("## Projects", "");
		for (const { category, items } of groups) {
			lines.push(`### ${CATEGORY_TITLES[category] ?? category}`, "");
			for (const p of items) {
				const title = cleanText(p.title, 100) || p.slug;
				const slug = encodeURIComponent(p.slug);
				const summary = cleanText(p.summary, MAX_SUMMARY);
				const live = httpsUrl(p.link_web);
				const repo = httpsUrl(p.link_repo);
				const extras = [
					live ? `[live](${live})` : "",
					repo ? `[source](${repo})` : "",
				]
					.filter(Boolean)
					.join(", ");
				lines.push(
					`- [${title}](${origin}/${LLMS_LOCALE}/project/${slug})${
						summary ? `: ${summary}` : ""
					}${extras ? ` (${extras})` : ""}`,
				);
			}
			lines.push("");
		}
	}

	lines.push(
		"## Notes",
		"",
		`- Default language: ${defaultLocale}. Every page exists in ${locales.join(", ")}; project texts above are in English.`,
		`- [Sitemap](${origin}/sitemap-index.xml)`,
		"",
	);
	return lines.join("\n");
};

let cached: { value: Projects[]; at: number } | null = null;

/** Proyectos publicados (en ingles). Si el backend no responde, el ultimo valor bueno o nada. */
export const getProjectsForLlms = async (
	now = Date.now(),
): Promise<Projects[]> => {
	if (cached && now - cached.at < PROJECTS_TTL_MS) return cached.value;
	try {
		const { data } = await api.get<{ data?: { rows?: Projects[] } }>(
			`/projects?currentLocale=${LLMS_LOCALE}`,
			{ timeoutMs: PROJECTS_TIMEOUT_MS },
		);
		const rows = data?.data?.rows;
		if (!Array.isArray(rows)) throw new Error("proyectos no validos");
		cached = { value: rows, at: now };
		return rows;
	} catch {
		return cached?.value ?? [];
	}
};

/** Solo para pruebas. */
export const resetProjectsCache = (): void => {
	cached = null;
};
