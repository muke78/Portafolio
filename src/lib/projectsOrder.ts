import { CATEGORIES, type Projects } from "@/types/currentLang.interface";

/**
 * Tarjetas que cada categoria muestra antes de pedir "Ver N mas". Al abrirlo salen
 * TODAS las demas de golpe: no hay paginas ni tope, solo una primera pantalla corta.
 */
export const INITIAL_VISIBLE = 6;

/**
 * Orden de una categoria: los destacados primero y, dentro de cada grupo, el orden del
 * CMS (el backend ya los entrega por `sort_order`). No muta la lista original.
 */
export const orderProjects = (rows: readonly Projects[]): Projects[] => [
	...rows.filter((p) => p.featured),
	...rows.filter((p) => !p.featured),
];

export interface CategorySection {
	category: Projects["category"];
	projects: Projects[];
}

/** Las categorias que tienen proyectos, en el orden fijo del sitio y cada una ya ordenada. */
export const groupByCategory = (rows: readonly Projects[]): CategorySection[] =>
	CATEGORIES.map((category) => ({
		category,
		projects: orderProjects(rows.filter((p) => p.category === category)),
	})).filter((section) => section.projects.length > 0);

/** `Ver {n} mas de {category}`: rellena los huecos de una cadena de i18n. */
export const fill = (
	template: string,
	values: Record<string, string | number>,
): string =>
	template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
