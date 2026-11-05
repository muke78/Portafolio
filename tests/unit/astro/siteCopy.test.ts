import reactRenderer from "@astrojs/react/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "@/components/sections/Header.astro";
import Manifiesto from "@/components/sections/Manifiesto.astro";
import { getI18N } from "@/i18n";
import Layout from "@/layouts/Layout.astro";
import { resetContactCache } from "@/lib/siteContact";
import { resetSiteCopyCache } from "@/lib/siteCopy";

const apiGet = vi.fn();
vi.mock("@/lib/api", () => ({
	api: { get: (...a: unknown[]) => apiGet(...a) },
}));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "secret-token" }));

const es = getI18N({ currentLocale: "es" });

const COPY = {
	hero_image: "site/foto.webp",
	hero_image_alt: "Retrato desde el CMS",
	hero_label: "Etiqueta del CMS",
	hero_lead: "Presentación del CMS",
	manifesto_text: "Frase del CMS",
	meta_description: "Descripción del CMS",
};

/** El backend responde los textos del sitio; el resto (contacto) falla y usa su respaldo. */
const backend = (copy: unknown) =>
	apiGet.mockImplementation(async (path: string) => {
		if (path.startsWith("/site-copy")) return { data: { data: copy } };
		throw new Error("sin backend");
	});

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

beforeEach(() => {
	apiGet.mockReset();
	resetSiteCopyCache();
	resetContactCache();
});

describe("el hero con los textos del CMS", () => {
	it("pinta la foto desde el bucket, con su alt, y la precarga para el LCP", async () => {
		backend(COPY);
		const html = await render(Header);
		expect(html).toMatch(/<img[^>]+src="https:\/\/[^"]+\/site\/foto\.webp"/);
		expect(html).toContain('alt="Retrato desde el CMS"');
		expect(html).toMatch(
			/<link rel="preload" as="image" href="https:\/\/[^"]+\/site\/foto\.webp" fetchpriority="high"/,
		);
		expect(html).toContain("Etiqueta del CMS");
		expect(html).toContain("Presentación del CMS");
		// El respaldo estatico no se usa cuando hay foto del CMS.
		expect(html).not.toContain("/_image");
	});

	it("la clave de R2 nunca sale como ruta relativa del propio sitio", async () => {
		backend({ ...COPY, hero_image: "Aboutme.webp" });
		const html = await render(Header);
		expect(html).not.toMatch(/src="Aboutme\.webp"/);
		expect(html).toMatch(/src="https:\/\/[^"]+\/Aboutme\.webp"/);
	});

	it("sin backend usa la foto estatica del repo y los textos de los archivos de idioma", async () => {
		apiGet.mockRejectedValue(new Error("sin backend"));
		const html = await render(Header);
		expect(html).toContain("/_image");
		expect(html).toContain(es.HEADER.HEADER_SUBTITLE);
		expect(html).toContain('alt="muke78"');
		expect(html).not.toContain('rel="preload" as="image"');
	});

	it("un valor raro del backend (foto en otro sitio) se ignora y usa el respaldo", async () => {
		backend({ ...COPY, hero_image: "https://evil.example/x.webp" });
		const html = await render(Header);
		expect(html).not.toContain("evil.example");
		expect(html).toContain("/_image");
	});

	it("el boton Ver CV abre el PDF del CMS, desde el bucket y en pestana nueva", async () => {
		backend({ ...COPY, cv_pdf: "cv/CV-Erick-Gonzalez-ab12cd34.pdf" });
		const html = await render(Header);
		expect(html).toMatch(
			/<a href="https:\/\/[^"]+\/cv\/CV-Erick-Gonzalez-ab12cd34\.pdf"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/,
		);
		expect(html).toContain(es.ABOUTME.ABOUT_DOWNLOAD_CV);
		expect(html).not.toContain("vercel-storage");
	});

	it("sin PDF cargado (o con un valor raro) no hay boton de CV", async () => {
		for (const cv_pdf of [null, undefined, "https://evil.example/cv.pdf"]) {
			apiGet.mockReset();
			resetSiteCopyCache();
			backend({ ...COPY, cv_pdf });
			const html = await render(Header);
			expect(html).not.toContain(es.ABOUTME.ABOUT_DOWNLOAD_CV);
			expect(html).not.toContain("evil.example");
		}
	});

	it("sin backend tampoco hay boton de CV (nunca se enlaza a una URL fija)", async () => {
		apiGet.mockRejectedValue(new Error("sin backend"));
		const html = await render(Header);
		expect(html).not.toContain(es.ABOUTME.ABOUT_DOWNLOAD_CV);
		expect(html).not.toContain("vercel-storage");
	});

	it("el manifiesto y la descripcion del sitio tambien vienen del CMS", async () => {
		backend(COPY);
		expect(await render(Manifiesto)).toContain("Frase del CMS");
		const layout = await render(Layout);
		expect(layout).toContain('content="Descripción del CMS"');
		expect(layout).toContain('"description":"Descripción del CMS"');
	});

	it("sin backend el manifiesto y la descripcion salen de los archivos de idioma", async () => {
		apiGet.mockRejectedValue(new Error("sin backend"));
		expect(await render(Manifiesto)).toContain(es.MANIFESTO.TEXT);
		expect(await render(Layout)).toContain(es.META.META_DESCRIPTION);
	});
});
