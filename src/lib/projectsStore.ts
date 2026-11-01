import type { Projects } from "@/types/currentLang.interface";

/**
 * Client-side, shared and memoised projects request.
 *
 * Each category rail is its own island and hydrates when it nears the
 * viewport; all of them ask for the same list, so the network sees ONE
 * request per language, and none at all until the first rail is close.
 * A failed request is not cached (the next rail may retry).
 */
const pending = new Map<string, Promise<Projects[]>>();

export const loadProjects = (locale: string): Promise<Projects[]> => {
	const hit = pending.get(locale);
	if (hit) return hit;

	const request = fetch(`/api/projects?currentLocale=${locale}`)
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		})
		.then((body) => (body?.data?.rows ?? []) as Projects[])
		.catch((err) => {
			pending.delete(locale);
			console.error("Error al cargar proyectos:", err);
			return [] as Projects[];
		});

	pending.set(locale, request);
	return request;
};
