import reactRenderer from "@astrojs/react/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Acerca from "@/components/sections/Acerca.astro";
import Contacto from "@/components/sections/Contacto.astro";
import Footer from "@/components/sections/Footer.astro";
import Header from "@/components/sections/Header.astro";
import Manifiesto from "@/components/sections/Manifiesto.astro";
import Opiniones from "@/components/sections/Opiniones.astro";
import Proyectos from "@/components/sections/Proyectos.astro";
import { getI18N } from "@/i18n";
import Layout from "@/layouts/Layout.astro";
import Home from "@/pages/[lang]/home.astro";
import ProjectDetail from "@/pages/[lang]/project/[id].astro";
import NotFound from "@/pages/404.astro";

// The detail page asks the API for the projects on the server.
const apiGet = vi.fn();
vi.mock("@/lib/api", () => ({
	api: { get: (...a: unknown[]) => apiGet(...a) },
}));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "secret-token" }));

const es = getI18N({ currentLocale: "es" });

const render = async (
	component: Parameters<AstroContainer["renderToString"]>[0],
	options: Parameters<AstroContainer["renderToString"]>[1] = {},
) => {
	const container = await AstroContainer.create();
	container.addServerRenderer({
		name: "@astrojs/react",
		renderer: reactRenderer,
	});
	container.addClientRenderer({
		name: "@astrojs/react",
		entrypoint: "@astrojs/react/client.js",
	});
	return container.renderToString(component, options);
};

const count = (html: string, pattern: RegExp) =>
	(html.match(pattern) ?? []).length;

beforeEach(() => {
	apiGet.mockReset();
});

describe("Acerca", () => {
	it("lays the four About scenes one after another, as lazy islands, with no tabs", async () => {
		const html = await render(Acerca);
		expect(count(html, /<astro-island/g)).toBe(4);
		expect(html).toContain('client="visible"');
		expect(html).not.toMatch(/role="tab"/);
		for (const title of [
			es.ABOUTME.ABOUT_TITLE,
			es.EDUCATION.EDUCATION_TITLE,
			es.ABOUTME.EXPERIENCE,
			es.SKILLS.SKILLS_TITLE,
		]) {
			expect(html).toContain(title);
		}
	});
});

describe("Proyectos", () => {
	it("renders one pinned rail wrapper per category and fetches nothing on the server", async () => {
		const html = await render(Proyectos);
		expect(count(html, /<div data-hscroll>/g)).toBe(4);
		expect(count(html, /<astro-island/g)).toBe(4);
		expect(html).toContain(es.PROJECTS.PROJECTS_TITLE);
		expect(apiGet).not.toHaveBeenCalled();
	});

	it("loads each rail a screen early (rootMargin 500px)", async () => {
		const html = await render(Proyectos);
		expect(html).toContain("500px");
	});
});

describe("Opiniones and Contacto", () => {
	it("Opiniones hydrates lazily and does not read the API on the server", async () => {
		const html = await render(Opiniones);
		expect(count(html, /<astro-island/g)).toBe(1);
		expect(html).toContain("500px");
		expect(apiGet).not.toHaveBeenCalled();
	});

	it("Contacto mounts the form as a visible-island", async () => {
		const html = await render(Contacto);
		expect(count(html, /<astro-island/g)).toBe(1);
		expect(html).toContain(es.FORM.BUTTON_LABEL);
	});
});

describe("Manifiesto", () => {
	it("exposes every hook of the pinned reading scene", async () => {
		const html = await render(Manifiesto);
		for (const hook of [
			"data-manifesto",
			"data-manifesto-text",
			"data-manifesto-track",
			"data-manifesto-chip",
			"data-manifesto-progress",
		]) {
			expect(html).toContain(hook);
		}
	});

	it("keeps the sentence readable in the HTML without JavaScript", async () => {
		const html = await render(Manifiesto);
		expect(html).toContain(es.MANIFESTO.TEXT);
	});

	it("repeats the technology names in two different orders", async () => {
		const html = await render(Manifiesto);
		expect(html).toContain("React");
		expect(html).toContain("Three.js");
	});
});

describe("Header (hero)", () => {
	it("has the one h1 with the name split in two lines for the intro", async () => {
		const html = await render(Header);
		expect(count(html, /<h1/g)).toBe(1);
		expect(count(html, /data-hero-line/g)).toBe(2);
		expect(html).toContain("Erick");
	});

	it("marks the pieces the load sequence animates", async () => {
		const html = await render(Header);
		for (const hook of [
			"data-hero",
			"data-hero-label",
			"data-hero-lead",
			"data-hero-cta",
			"data-hero-portrait",
			"data-hero-rings",
			"data-hero-bar",
		]) {
			expect(html).toContain(hook);
		}
	});

	it("points the scroll cue at the 'Qué hago' section", async () => {
		const html = await render(Header);
		expect(html).toContain('href="#what"');
	});

	it("serves the portrait through astro:assets with a text alternative", async () => {
		const html = await render(Header);
		expect(html).toMatch(/<img[^>]*alt="[^"]+"/);
	});
});

describe("Footer", () => {
	it("is a real footer with real headings and the site links", async () => {
		const html = await render(Footer);
		expect(html).toContain("<footer");
		expect(html).toContain(es.FOOTER.SITE);
		expect(html).toContain(es.FOOTER.ELSEWHERE);
		expect(html).toMatch(/<h2/);
		expect(html).not.toMatch(/<h5/);
	});

	it("links every nav section", async () => {
		const html = await render(Footer);
		for (const anchor of [
			"#home",
			"#about",
			"#projects",
			"#opinions",
			"#contact",
		]) {
			expect(html).toContain(`href="${anchor}"`);
		}
	});

	it("does not link to the removed admin panel", async () => {
		const html = await render(Footer);
		expect(html).not.toContain("/admin");
	});

	it("shows the current year", async () => {
		const html = await render(Footer);
		expect(html).toContain(String(new Date().getFullYear()));
	});
});

describe("Layout", () => {
	it("is a complete document with title, description and social tags", async () => {
		const html = await render(Layout, {
			partial: false,
			request: new Request("http://localhost/es/home"),
		});
		expect(html.toLowerCase()).toContain("<!doctype html>");
		expect(html).toContain('<html lang="es"');
		expect(html).toContain(`<title>${es.META.META_TITLE}</title>`);
		expect(html).toContain('property="og:title"');
		expect(html).toContain('name="description"');
		expect(html).toContain("application/ld+json");
	});

	it("takes a custom title and description from the page", async () => {
		const html = await render(Layout, {
			props: { title: "Proyecto — Erick", description: "Descripción propia" },
			request: new Request("http://localhost/es/project/x"),
		});
		expect(html).toContain("<title>Proyecto — Erick</title>");
		expect(html).toContain("Descripción propia");
	});

	it("offers a skip link, the reading progress hairline and a canonical-style og:url", async () => {
		const html = await render(Layout, {
			request: new Request("http://localhost/es/home"),
		});
		expect(html).toContain('href="#main-content"');
		expect(html).toContain("data-scroll-progress");
		expect(html).toContain("og:url");
	});

	it("does not force CSS smooth scrolling on <html> (it fights the pinned scroll)", async () => {
		const html = await render(Layout, {
			request: new Request("http://localhost/es/home"),
		});
		expect(html).not.toMatch(/<html[^>]*scroll-smooth/);
	});
});

describe("Home page", () => {
	it("stacks every section under #main-content, in reading order", async () => {
		const html = await render(Home, {
			request: new Request("http://localhost/es/home"),
		});
		expect(html).toContain('id="main-content"');
		const order = [
			'id="home"',
			'id="what"',
			'id="about"',
			'id="projects"',
			'id="opinions"',
			'id="contact"',
		].map((id) => html.indexOf(id));
		for (const at of order) expect(at).toBeGreaterThan(-1);
		expect([...order].sort((a, b) => a - b)).toEqual(order);
	});

	it("loads the nav and the comment launcher once the page is idle", async () => {
		const html = await render(Home, {
			request: new Request("http://localhost/es/home"),
		});
		expect(html).toContain('client="idle"');
		expect(count(html, /client="idle"/g)).toBeGreaterThanOrEqual(2);
	});
});

describe("404 page", () => {
	it("explains where the reader is, with a single h1", async () => {
		const html = await render(NotFound, {
			request: new Request("http://localhost/xx"),
		});
		expect(count(html, /<h1/g)).toBe(1);
		expect(html).toContain("404");
		expect(html).toContain(es[404]["404_BODY"]);
	});
});

describe("Project detail page", () => {
	const row = (over: Record<string, unknown> = {}) => ({
		project_id: 1,
		slug: "mi-proyecto",
		category: "frontend",
		card_image: "card.png",
		images_topics: ["react", "astro"],
		link_repo: "https://github.com/muke78/x",
		link_web: "https://x.dev",
		title: "Mi proyecto",
		description: "Una descripción del proyecto",
		fork: false,
		...over,
	});
	const rows = [
		row(),
		row({ project_id: 2, slug: "segundo", title: "Segundo" }),
		row({ project_id: 3, slug: "api", category: "backend", title: "API" }),
	];
	const renderDetail = (id: string) =>
		render(ProjectDetail, {
			params: { lang: "es", id },
			request: new Request(`http://localhost/es/project/${id}`),
		});

	it("renders the project found by slug with its own title, description and hooks", async () => {
		apiGet.mockResolvedValue({ data: { data: { rows } } });
		const html = await renderDetail("mi-proyecto");
		expect(html).toContain("<title>Mi proyecto — ");
		expect(html).toContain("Una descripción del proyecto");
		expect(count(html, /<h1/g)).toBe(1);
		for (const hook of [
			"data-detail",
			"data-detail-back",
			"data-detail-title",
			"data-detail-figure",
			"data-detail-img",
		]) {
			expect(html).toContain(hook);
		}
		expect(html).toContain('href="/es/home#projects"');
	});

	it("finds a project by numeric id too", async () => {
		apiGet.mockResolvedValue({ data: { data: { rows } } });
		const html = await renderDetail("2");
		expect(html).toContain("Segundo");
	});

	it("sends the language to the API (the client adds the token)", async () => {
		apiGet.mockResolvedValue({ data: { data: { rows } } });
		await renderDetail("mi-proyecto");
		expect(apiGet).toHaveBeenCalledWith("/projects?currentLocale=es");
	});

	it("links to the next project of the same category only", async () => {
		apiGet.mockResolvedValue({ data: { data: { rows } } });
		const html = await renderDetail("mi-proyecto");
		expect(html).toContain("/es/project/segundo");
		expect(html).not.toContain("/es/project/api");
	});

	it("stays calm when the API is down (no stack trace in the page)", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		apiGet.mockRejectedValue(new Error("secret internals"));
		const html = await renderDetail("mi-proyecto");
		expect(html).not.toContain("secret internals");
		expect(html).not.toContain("secret-token");
	});

	it("does not invent a project that does not exist", async () => {
		apiGet.mockResolvedValue({ data: { data: { rows } } });
		const html = await renderDetail("no-existe");
		expect(html).not.toContain("Mi proyecto");
	});
});
