// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { getI18N } from "@/i18n";
import { RAIL_LIMIT } from "@/lib/projectsOrder";
import type { Projects } from "@/types/currentLang.interface";

const es = getI18N({ currentLocale: "es" });

const project = (id: number, over: Partial<Projects> = {}): Projects => ({
	project_id: id,
	slug: `p${id}`,
	category: "companies",
	card_image: "card.png",
	images_topics: ["react", "ts"],
	link_repo: "",
	link_web: "",
	title: `Proyecto ${id}`,
	summary: "Un resumen corto",
	description: "Una descripción larga",
	gallery: [],
	fork: false,
	featured: false,
	...over,
});

const many = (n: number) => Array.from({ length: n }, (_, i) => project(i + 1));

const stub = (rows: Projects[], status = 200) =>
	vi.stubGlobal(
		"fetch",
		vi
			.fn()
			.mockResolvedValue(
				new Response(JSON.stringify({ data: { rows } }), { status }),
			),
	);

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

describe("ProjectCard", () => {
	const card = (over: Partial<Projects> = {}, locale = "es") =>
		render(
			<ProjectCard
				currentLocale={locale as "es"}
				project={project(1, over)}
				categoryLabel="Empresas"
			/>,
		);

	it("el titulo es un enlace a la ruta de detalle del proyecto, en el idioma actual", () => {
		card({ slug: "mi-proyecto" }, "en");
		const link = screen.getByRole("link", { name: /Proyecto 1/ });
		expect(link).toHaveAttribute("href", "/en/project/mi-proyecto");
		expect(screen.getByRole("heading", { level: 4 })).toContainElement(link);
	});

	it("lee el resumen y solo cae a la descripcion si no hay resumen", () => {
		card();
		expect(screen.getByText("Un resumen corto")).toBeInTheDocument();
		expect(screen.queryByText("Una descripción larga")).toBeNull();
	});

	it("sin resumen usa la descripcion", () => {
		card({ summary: "" });
		expect(screen.getByText("Una descripción larga")).toBeInTheDocument();
	});

	it("muestra la categoria y las etiquetas de destacado y colaboracion solo cuando aplican", () => {
		const { unmount } = card();
		expect(screen.getByText("Empresas")).toBeInTheDocument();
		expect(screen.queryByText(es.PROJECTS.PROJECTS_BADGE_FEATURED)).toBeNull();
		expect(screen.queryByText(es.PROJECTS.PROJECTS_BADGE_FORK)).toBeNull();
		unmount();
		card({ featured: true, fork: true });
		expect(
			screen.getByText(es.PROJECTS.PROJECTS_BADGE_FEATURED),
		).toBeInTheDocument();
		expect(
			screen.getByText(es.PROJECTS.PROJECTS_BADGE_FORK),
		).toBeInTheDocument();
	});

	it("las imagenes son diferidas y llevan tamano: no empujan la pagina ni cargan antes de tiempo", () => {
		const { container } = card();
		const images = [...container.querySelectorAll("img")];
		expect(images.length).toBeGreaterThan(1);
		for (const img of images) {
			expect(img).toHaveAttribute("loading", "lazy");
			expect(img).toHaveAttribute("width");
			expect(img).toHaveAttribute("height");
		}
		// La imagen de portada es decorativa: el titulo ya dice de que trata.
		expect(images[0]).toHaveAttribute("alt", "");
	});

	it("el stack es una lista accesible con TODOS los iconos", () => {
		card({ images_topics: ["react", "astro", "ts", "css", "node", "bun"] });
		const stack = screen.getByRole("list", { name: es.PROJECT_DETAIL.STACK });
		expect(
			within(stack)
				.getAllByRole("img")
				.map((i) => i.getAttribute("alt")),
		).toEqual(["react", "astro", "ts", "css", "node", "bun"]);
	});

	it("la imagen entra entera: cortina en el marco y nada de zoom, deriva ni parallax", () => {
		const { container } = card();
		expect(container.querySelector("figure")).toHaveAttribute("data-mask");
		const img = container.querySelector("figure img");
		expect(img).not.toHaveAttribute("data-mask-img");
		expect(img).not.toHaveAttribute("data-rail-img");
		expect(img?.className).not.toMatch(/scale|w-\[1[2-9]\d%\]|-left-/);
		expect(container.querySelector("[data-parallax-img]")).toBeNull();
	});
});

describe("ProjectRail", () => {
	const load = async () =>
		(await import("@/features/projects/ProjectRail")).ProjectRail;

	it("en el servidor SIEMPRE pinta algo (titulo y esqueleto): una isla vacia nunca se hidrata con client:visible", async () => {
		const Rail = await load();
		const html = renderToString(
			<Rail currentLocale="es" category="companies" />,
		);
		expect(html).toContain('aria-busy="true"');
		expect(html).toContain(es.PROJECTS.PROJECTS_TITLE_BUTTON_C);
		expect(html).not.toContain("<article");
	});

	it("Ley de Hick: a lo mas 6 tarjetas grandes, aunque la categoria tenga 15", async () => {
		stub([
			...many(15),
			project(90, { category: "frontend", title: "Otra categoria" }),
		]);
		const Rail = await load();
		render(<Rail currentLocale="es" category="companies" />);
		expect(await screen.findAllByRole("article")).toHaveLength(RAIL_LIMIT);
		expect(screen.queryByText("Otra categoria")).toBeNull();
		expect(screen.getByText("6 de 15 proyectos")).toBeInTheDocument();
	});

	it("una categoria chica las muestra todas, sin boton", async () => {
		stub(many(3));
		const Rail = await load();
		render(<Rail currentLocale="es" category="companies" />);
		expect(await screen.findAllByRole("article")).toHaveLength(3);
		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.getByText("3 de 3 proyectos")).toBeInTheDocument();
	});

	it("es una seccion con nombre y ancla propia, con el titulo como h3 para el motor", async () => {
		stub(many(3));
		const Rail = await load();
		const { container } = render(
			<Rail currentLocale="es" category="companies" />,
		);
		const section = await screen.findByRole("region", {
			name: es.PROJECTS.PROJECTS_TITLE_BUTTON_C,
		});
		expect(section).toHaveAttribute("id", "proyectos-companies");
		const title = within(section).getByRole("heading", { level: 3 });
		expect(title).toHaveAttribute("data-split");
		expect(container.querySelector("[data-hscroll-viewport]")).not.toBeNull();
	});

	it("expone al motor la tira (una sola fila), cada tarjeta y la barra de progreso", async () => {
		stub(many(5));
		const Rail = await load();
		const { container } = render(
			<Rail currentLocale="es" category="companies" />,
		);
		await screen.findAllByRole("article");
		const track = container.querySelector("[data-hscroll-track]");
		expect(track?.tagName).toBe("UL");
		expect(track?.className).toContain("grid-rows-1");
		expect(track?.className).not.toContain("grid-rows-2");
		expect(container.querySelectorAll("[data-rail-card]")).toHaveLength(5);
		expect(container.querySelector("[data-hscroll-progress]")).not.toBeNull();
		expect(container.querySelector("[data-hscroll-current]")).toHaveTextContent(
			"1",
		);
	});

	it("los destacados salen primero", async () => {
		stub([
			project(1, { title: "Normal" }),
			project(2, { title: "Estrella", featured: true }),
		]);
		const Rail = await load();
		render(<Rail currentLocale="es" category="companies" />);
		const titles = (await screen.findAllByRole("heading", { level: 4 })).map(
			(h) => h.textContent,
		);
		expect(titles[0]).toContain("Estrella");
	});

	it("sin proyectos o si falla la peticion, lo dice en vez de dejar un hueco", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		stub([], 503);
		const Rail = await load();
		render(<Rail currentLocale="es" category="companies" />);
		expect(
			await screen.findByText(es.PROJECTS.PROJECTS_EMPTY),
		).toBeInTheDocument();
		expect(document.querySelector("[data-hscroll-progress]")).toBeNull();
	});
});

describe("ProjectMore", () => {
	const load = async () =>
		(await import("@/features/projects/ProjectMore")).ProjectMore;

	it("en el servidor SIEMPRE pinta un hijo: una isla vacia nunca se hidrata y el boton no aparecia", async () => {
		const More = await load();
		const html = renderToString(
			<More currentLocale="es" category="companies" />,
		);
		expect(html).not.toBe("");
		expect(html).toContain("<div");
	});

	it("con 15 proyectos el boton dice «Ver 9 mas de Empresas»", async () => {
		stub(many(15));
		const More = await load();
		render(<More currentLocale="es" category="companies" />);
		const button = await screen.findByRole("button", {
			name: `Ver 9 más de ${es.PROJECTS.PROJECTS_TITLE_BUTTON_C}`,
		});
		expect(button).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("list")).toBeNull();
	});

	it("si todo cabe en el riel no pinta nada", async () => {
		stub(many(RAIL_LIMIT));
		const More = await load();
		const { container } = render(
			<More currentLocale="es" category="companies" />,
		);
		await waitFor(() => expect(container.querySelector("div")).toBeNull());
		expect(screen.queryByRole("button")).toBeNull();
	});

	it("al abrir salen TODOS los demas como filas con enlace, sin tope, y el foco pasa a la primera", async () => {
		stub(many(25));
		const More = await load();
		const { container } = render(
			<More currentLocale="es" category="companies" />,
		);
		const button = await screen.findByRole("button", { name: /Ver 19 más/ });
		await userEvent.click(button);

		expect(button).toHaveAttribute("aria-expanded", "true");
		const rows = container.querySelectorAll("[data-peek-row]");
		expect(rows).toHaveLength(19);
		expect(container.querySelector("[data-peek]")).toBeInTheDocument();
		// Cada fila lleva a su detalle.
		expect(rows[0].querySelector("a")).toHaveAttribute(
			"href",
			`/es/project/p${RAIL_LIMIT + 1}`,
		);
		await waitFor(() => expect(rows[0].querySelector("a")).toHaveFocus());
		expect(screen.getByRole("status")).toHaveTextContent("25 de 25 proyectos");
	});

	it("al cerrar el foco vuelve al boton y el anuncio es solo tras una accion", async () => {
		stub(many(10));
		const More = await load();
		render(<More currentLocale="es" category="companies" />);
		const button = await screen.findByRole("button", { name: /Ver 4 más/ });
		expect(screen.getByRole("status")).toHaveTextContent("");
		await userEvent.click(button);
		await userEvent.click(
			screen.getByRole("button", { name: es.PROJECTS.PROJECTS_SHOW_LESS }),
		);
		expect(screen.queryByRole("list")).toBeNull();
		await waitFor(() =>
			expect(screen.getByRole("button", { name: /Ver 4 más/ })).toHaveFocus(),
		);
	});

	it("la fila lleva la vista previa grande (decorativa, sin zoom) para el motor", async () => {
		stub(many(8));
		const More = await load();
		const { container } = render(
			<More currentLocale="es" category="companies" />,
		);
		await userEvent.click(await screen.findByRole("button", { name: /Ver 2/ }));
		const row = container.querySelector("[data-peek-row]");
		const preview = row?.querySelector("[data-peek-img]");
		expect(preview).toHaveAttribute("alt", "");
		expect(preview?.className).toContain("invisible");
		expect(preview?.className).not.toMatch(/scale/);
		// En tactil (sin hover) la fila lleva su propia miniatura.
		expect(row?.querySelectorAll("img")).toHaveLength(2);
	});
});
