import type { Projects } from "@/types/currentLang.interface";

/** Tarjetas que caben en el riel fijado de una categoria; el resto va en "Ver todos". */
export const RAIL_LIMIT = 6;
/** Tarjetas que suma cada "Mostrar mas" en la cuadricula. */
export const PAGE_SIZE = 9;

/**
 * Orden de una categoria: los destacados primero y, dentro de cada grupo, el orden del
 * CMS (el backend ya los entrega por `sort_order`). No muta la lista original.
 */
export const orderProjects = (rows: readonly Projects[]): Projects[] => [
	...rows.filter((p) => p.featured),
	...rows.filter((p) => !p.featured),
];

/** `Ver {n} mas de {category}`: rellena los huecos de una cadena de i18n. */
export const fill = (
	template: string,
	values: Record<string, string | number>,
): string =>
	template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
