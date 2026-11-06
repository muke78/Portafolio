import { describe, expect, it } from "vitest";
import {
	fill,
	groupByCategory,
	INITIAL_VISIBLE,
	orderProjects,
} from "@/lib/projectsOrder";
import type { Projects } from "@/types/currentLang.interface";

const p = (id: number, featured = false, category = "frontend") =>
	({ project_id: id, featured, category }) as Projects;

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

describe("groupByCategory", () => {
	it("agrupa en el orden fijo del sitio, omite las vacias y ordena cada una", () => {
		const rows = [
			p(1, false, "companies"),
			p(2, false, "frontend"),
			p(3, true, "companies"),
			p(4, false, "dataAnalyst"),
		];
		const sections = groupByCategory(rows);
		expect(sections.map((s) => s.category)).toEqual([
			"frontend",
			"companies",
			"dataAnalyst",
		]);
		expect(sections[1].projects.map((r) => r.project_id)).toEqual([3, 1]);
	});

	it("sin proyectos no hay secciones", () => {
		expect(groupByCategory([])).toEqual([]);
	});

	it("no pierde ninguno: todos los proyectos salen en alguna seccion", () => {
		const rows = Array.from({ length: 40 }, (_, i) =>
			p(
				i + 1,
				i % 7 === 0,
				["frontend", "backend", "companies", "dataAnalyst"][i % 4],
			),
		);
		const total = groupByCategory(rows).reduce(
			(n, s) => n + s.projects.length,
			0,
		);
		expect(total).toBe(40);
	});
});

describe("limites y fill", () => {
	it("la primera pantalla de una categoria es corta", () => {
		expect(INITIAL_VISIBLE).toBe(6);
	});

	it("fill rellena los huecos y deja vacio el que no existe", () => {
		expect(
			fill("Ver {n} más de {category}", { n: 8, category: "Frontend" }),
		).toBe("Ver 8 más de Frontend");
		expect(fill("{x}!", {})).toBe("!");
	});
});
