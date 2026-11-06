// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { ProjectCategory } from "@/features/projects/ProjectCategory";
import { getI18N } from "@/i18n";
import { INITIAL_VISIBLE } from "@/lib/projectsOrder";
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

	it("el stack es una lista accesible de iconos", () => {
		card({ images_topics: ["react", "astro", "ts"] });
		const stack = screen.getByRole("list", { name: es.PROJECT_DETAIL.STACK });
		expect(
			within(stack)
				.getAllByRole("img")
				.map((i) => i.getAttribute("alt")),
		).toEqual(["react", "astro", "ts"]);
	});

	it("no lleva parallax ni mascara: nada que animar por tarjeta", () => {
		const { container } = card();
		expect(container.querySelector("[data-parallax-img]")).toBeNull();
		expect(container.querySelector("[data-mask]")).toBeNull();
	});
});

describe("ProjectCategory", () => {
	const category = (projects: Projects[]) =>
		render(
			<ProjectCategory
				currentLocale="es"
				category="companies"
				label="Empresas"
				projects={projects}
			/>,
		);

	it("con 6 o menos muestra todas y no hay boton", () => {
		category(many(INITIAL_VISIBLE));
		expect(screen.getAllByRole("article")).toHaveLength(INITIAL_VISIBLE);
		expect(screen.queryByRole("button")).toBeNull();
		expect(screen.getByText("6 de 6 proyectos")).toBeInTheDocument();
	});

	it("con mas de 6 muestra 6 y el boton 'Ver N mas de Categoria' con el total real", () => {
		category(many(18));
		expect(screen.getAllByRole("article")).toHaveLength(6);
		expect(
			screen.getByRole("button", { name: "Ver 12 más de Empresas" }),
		).toHaveAttribute("aria-expanded", "false");
		expect(screen.getByText("6 de 18 proyectos")).toBeInTheDocument();
	});

	it("el boton abre TODOS los demas de una vez, sin paginas ni tope", async () => {
		category(many(18));
		await userEvent.click(
			screen.getByRole("button", { name: "Ver 12 más de Empresas" }),
		);
		expect(screen.getAllByRole("article")).toHaveLength(18);
		const toggle = screen.getByRole("button", {
			name: es.PROJECTS.PROJECTS_SHOW_LESS,
		});
		expect(toggle).toHaveAttribute("aria-expanded", "true");
		expect(screen.getAllByText("18 de 18 proyectos").length).toBeGreaterThan(0);
	});

	it("el boton controla la lista y, al abrir, el foco pasa a la primera tarjeta nueva", async () => {
		category(many(10));
		const toggle = screen.getByRole("button", { name: /Ver 4 más/ });
		const list = document.getElementById(
			toggle.getAttribute("aria-controls") ?? "",
		);
		expect(list?.tagName).toBe("UL");

		await userEvent.click(toggle);
		await waitFor(() =>
			expect(screen.getByRole("link", { name: /Proyecto 7/ })).toHaveFocus(),
		);
	});

	it("al cerrar vuelve a 6 y el foco regresa al boton", async () => {
		category(many(10));
		await userEvent.click(screen.getByRole("button", { name: /Ver 4 más/ }));
		const toggle = screen.getByRole("button", {
			name: es.PROJECTS.PROJECTS_SHOW_LESS,
		});
		await userEvent.click(toggle);
		expect(screen.getAllByRole("article")).toHaveLength(6);
		await waitFor(() =>
			expect(screen.getByRole("button", { name: /Ver 4 más/ })).toHaveFocus(),
		);
	});

	it("solo las primeras 6 entran con fade-up; las que abre el boton salen ya visibles", async () => {
		const { container } = category(many(9));
		expect(container.querySelectorAll("[data-reveal]")).toHaveLength(6);
		await userEvent.click(screen.getByRole("button", { name: /Ver 3 más/ }));
		expect(container.querySelectorAll("article")).toHaveLength(9);
		expect(container.querySelectorAll("[data-reveal]")).toHaveLength(6);
	});

	it("es una seccion con nombre, ancla propia y una region de estado para lectores", () => {
		category(many(8));
		const section = screen.getByRole("region", { name: "Empresas" });
		expect(section).toHaveAttribute("id", "proyectos-companies");
		expect(
			within(section).getByRole("heading", { level: 3, name: "Empresas" }),
		).toBeInTheDocument();
		expect(within(section).getByRole("status")).toBeInTheDocument();
	});

	it("no anuncia nada al montar: el anuncio es solo tras una accion", async () => {
		category(many(8));
		expect(screen.getByRole("status")).toHaveTextContent("");
		await userEvent.click(screen.getByRole("button", { name: /Ver 2 más/ }));
		expect(screen.getByRole("status")).toHaveTextContent("8 de 8 proyectos");
	});
});

describe("ProjectsCatalog", () => {
	const stub = (rows: Projects[], status = 200) =>
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					new Response(JSON.stringify({ data: { rows } }), { status }),
				),
		);
	const load = async () =>
		(await import("@/features/projects/ProjectsCatalog")).ProjectsCatalog;

	it("en el servidor SIEMPRE pinta algo (un esqueleto): una isla vacia nunca se hidrata con client:visible", async () => {
		const Catalog = await load();
		const html = renderToString(<Catalog currentLocale="es" />);
		expect(html).not.toBe("");
		expect(html).toContain('aria-busy="true"');
		expect(html).not.toContain("<article");
	});

	it("muestra un esqueleto y despues el indice y las categorias con proyectos", async () => {
		stub([
			...many(8),
			project(50, { category: "frontend", title: "Front 1" }),
			project(51, { category: "backend", title: "Back 1" }),
		]);
		const Catalog = await load();
		render(<Catalog currentLocale="es" />);
		expect(screen.getByTestId("projects-loading")).toBeInTheDocument();

		const nav = await screen.findByRole("navigation", {
			name: es.PROJECTS.PROJECTS_NAV_LABEL,
		});
		const links = within(nav).getAllByRole("link");
		expect(links.map((l) => l.textContent)).toEqual([
			`${es.PROJECTS.PROJECTS_TITLE_BUTTON_F}1`,
			`${es.PROJECTS.PROJECTS_TITLE_BUTTON_B}1`,
			`${es.PROJECTS.PROJECTS_TITLE_BUTTON_C}8`,
		]);
		expect(links[2]).toHaveAttribute("href", "#proyectos-companies");
		expect(document.getElementById("proyectos-companies")).toBeInTheDocument();
	});

	it("la categoria con 18 muestra el boton 'Ver 12 mas' y al abrirlo salen los 18", async () => {
		stub(many(18));
		const Catalog = await load();
		render(<Catalog currentLocale="es" />);
		const button = await screen.findByRole("button", {
			name: `Ver 12 más de ${es.PROJECTS.PROJECTS_TITLE_BUTTON_C}`,
		});
		await userEvent.click(button);
		expect(screen.getAllByRole("article")).toHaveLength(18);
	});

	it("con una sola categoria no hay indice", async () => {
		stub(many(3));
		const Catalog = await load();
		render(<Catalog currentLocale="es" />);
		await screen.findAllByRole("article");
		expect(screen.queryByRole("navigation")).toBeNull();
	});

	it("los destacados salen primero dentro de su categoria", async () => {
		stub([
			project(1, { title: "Normal" }),
			project(2, { title: "Estrella", featured: true }),
		]);
		const Catalog = await load();
		render(<Catalog currentLocale="es" />);
		const titles = (await screen.findAllByRole("heading", { level: 4 })).map(
			(h) => h.textContent,
		);
		expect(titles[0]).toContain("Estrella");
	});

	it("sin proyectos o si falla la peticion, lo dice en vez de dejar un hueco", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		stub([], 503);
		const Catalog = await load();
		render(<Catalog currentLocale="es" />);
		expect(
			await screen.findByText(es.PROJECTS.PROJECTS_EMPTY),
		).toBeInTheDocument();
	});
});
