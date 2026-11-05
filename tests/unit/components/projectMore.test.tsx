// @vitest-environment jsdom
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getI18N } from "@/i18n";
import type { Projects } from "@/types/currentLang.interface";

const es = getI18N({ currentLocale: "es" });

const project = (id: number, over: Partial<Projects> = {}): Projects => ({
	project_id: id,
	slug: `p${id}`,
	category: "frontend",
	card_image: "card.png",
	images_topics: ["react"],
	link_repo: "",
	link_web: "",
	title: `Proyecto ${id}`,
	summary: "Resumen",
	description: "Descripción",
	gallery: [],
	fork: false,
	featured: false,
	...over,
});

const stubRows = (rows: Projects[]) =>
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { rows } }))),
	);

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

// projectsStore guarda la peticion en memoria: cada prueba la reinicia.
const load = async () =>
	(await import("@/features/projects/ProjectMore")).ProjectMore;

describe("ProjectMore", () => {
	it("no pinta nada si la categoria cabe en el riel", async () => {
		const fetchSpy = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					data: { rows: Array.from({ length: 6 }, (_, i) => project(i + 1)) },
				}),
			),
		);
		vi.stubGlobal("fetch", fetchSpy);
		const More = await load();
		const { container } = render(
			<More currentLocale="es" category="frontend" />,
		);
		await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(container).toBeEmptyDOMElement();
	});

	it("ofrece abrir el resto como boton con aria-expanded y lo muestra en una cuadricula", async () => {
		stubRows(Array.from({ length: 8 }, (_, i) => project(i + 1)));
		const More = await load();
		render(<More currentLocale="es" category="frontend" />);

		const toggle = await screen.findByRole("button", {
			name: `Ver 2 más de ${es.PROJECTS.PROJECTS_TITLE_BUTTON_F}`,
		});
		expect(toggle).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByText("Proyecto 7")).toBeNull();

		await userEvent.click(toggle);
		expect(toggle).toHaveAttribute("aria-expanded", "true");
		expect(toggle).toHaveTextContent(es.PROJECTS.PROJECTS_SHOW_LESS);
		// Los 6 primeros viven en el riel; aqui solo el resto.
		expect(screen.getByText("Proyecto 7")).toBeInTheDocument();
		expect(screen.getByText("Proyecto 8")).toBeInTheDocument();
		expect(screen.queryByText("Proyecto 6")).toBeNull();

		await userEvent.click(toggle);
		expect(screen.queryByText("Proyecto 7")).toBeNull();
	});

	it("pagina de a 9 con el boton de mostrar mas y solo muestra su categoria", async () => {
		stubRows([
			...Array.from({ length: 6 + 12 }, (_, i) => project(i + 1)),
			project(100, { category: "backend", title: "Otro back" }),
		]);
		const More = await load();
		render(<More currentLocale="es" category="frontend" />);
		await userEvent.click(
			await screen.findByRole("button", { name: /Ver 12 más de/ }),
		);
		expect(screen.getAllByRole("article")).toHaveLength(9);
		expect(screen.queryByText("Otro back")).toBeNull();

		await userEvent.click(
			screen.getByRole("button", {
				name: es.PROJECTS.PROJECTS_LOAD_MORE.replace("{n}", "3"),
			}),
		);
		expect(screen.getAllByRole("article")).toHaveLength(12);
		expect(
			screen.queryByRole("button", { name: /Mostrar \d+ más/ }),
		).toBeNull();
	});

	it("el boton controla la region que abre", async () => {
		stubRows(Array.from({ length: 7 }, (_, i) => project(i + 1)));
		const More = await load();
		render(<More currentLocale="es" category="frontend" />);
		const toggle = await screen.findByRole("button", { name: /Ver 1 más de/ });
		const region = document.getElementById(
			toggle.getAttribute("aria-controls") ?? "",
		);
		expect(region).toBeInTheDocument();
		expect(region).toHaveAttribute("hidden");
		await userEvent.click(toggle);
		expect(region).not.toHaveAttribute("hidden");
		expect(within(region as HTMLElement).getAllByRole("article")).toHaveLength(
			1,
		);
	});
});
