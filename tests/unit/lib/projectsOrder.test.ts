import { describe, expect, it } from "vitest";
import {
	fill,
	orderProjects,
	PAGE_SIZE,
	RAIL_LIMIT,
} from "@/lib/projectsOrder";
import type { Projects } from "@/types/currentLang.interface";

const p = (id: number, featured = false) =>
	({ project_id: id, featured }) as Projects;

describe("orderProjects", () => {
	it("pone los destacados primero y respeta el orden del CMS dentro de cada grupo", () => {
		const rows = [p(1), p(2, true), p(3), p(4, true), p(5)];
		expect(orderProjects(rows).map((r) => r.project_id)).toEqual([
			2, 4, 1, 3, 5,
		]);
	});

	it("no muta la lista original y acepta una lista vacia", () => {
		const rows = [p(1), p(2, true)];
		orderProjects(rows);
		expect(rows.map((r) => r.project_id)).toEqual([1, 2]);
		expect(orderProjects([])).toEqual([]);
	});

	it("sin destacados deja el orden tal cual", () => {
		expect(orderProjects([p(3), p(1), p(2)]).map((r) => r.project_id)).toEqual([
			3, 1, 2,
		]);
	});
});

describe("limites y fill", () => {
	it("el riel es corto y la pagina de la cuadricula es mayor que cero", () => {
		expect(RAIL_LIMIT).toBe(6);
		expect(PAGE_SIZE).toBeGreaterThan(0);
	});

	it("fill rellena los huecos y deja vacio el que no existe", () => {
		expect(
			fill("Ver {n} más de {category}", { n: 8, category: "Frontend" }),
		).toBe("Ver 8 más de Frontend");
		expect(fill("{x}!", {})).toBe("!");
	});
});
