import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:env/client", () => ({ VITE_API_URL: "https://api.test/api" }));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "test-token-value" }));

const {
	SITE_COPY_TIMEOUT_MS,
	SITE_COPY_TTL_MS,
	getSiteCopy,
	resetSiteCopyCache,
} = await import("@/lib/siteCopy");
const { siteCopySchema } = await import("@/schemas/siteCopySchema");

const COPY = {
	hero_image: "site/foto.webp",
	hero_image_alt: "Retrato",
	hero_label: "Etiqueta",
	hero_lead: "Presentación",
	manifesto_text: "Frase",
	meta_description: "Descripción",
};

beforeEach(() => resetSiteCopyCache());
afterEach(() => vi.unstubAllGlobals());

const reply = (body: unknown, status = 200) =>
	vi.fn().mockImplementation(async () => Response.json(body, { status }));

describe("getSiteCopy", () => {
	it("pide el idioma de la pagina y usa lo que entrega el backend", async () => {
		const fetchMock = reply({ success: true, data: COPY });
		vi.stubGlobal("fetch", fetchMock);
		expect(await getSiteCopy("en")).toEqual(COPY);
		expect(fetchMock.mock.calls[0][0]).toBe(
			"https://api.test/api/site-copy?currentLocale=en",
		);
	});

	it("una peticion por idioma y ventana, aunque la pidan varios a la vez", async () => {
		const fetchMock = reply({ data: COPY });
		vi.stubGlobal("fetch", fetchMock);
		await Promise.all([
			getSiteCopy("es"),
			getSiteCopy("es"),
			getSiteCopy("es"),
		]);
		await getSiteCopy("es");
		expect(fetchMock).toHaveBeenCalledTimes(1);
		await getSiteCopy("fr");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("pasada la ventana vuelve a preguntar y ve el cambio del CMS", async () => {
		const fetchMock = vi
			.fn()
			.mockImplementationOnce(async () => Response.json({ data: COPY }))
			.mockImplementationOnce(async () =>
				Response.json({ data: { ...COPY, hero_label: "Nueva" } }),
			);
		vi.stubGlobal("fetch", fetchMock);
		expect((await getSiteCopy("es"))?.hero_label).toBe("Etiqueta");
		const later = Date.now() + SITE_COPY_TTL_MS + 1;
		expect((await getSiteCopy("es", later))?.hero_label).toBe("Nueva");
	});

	it("sin respuesta, sin ficha o con datos raros devuelve null (el que llama usa su respaldo)", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("red")));
		expect(await getSiteCopy("es")).toBeNull();
		resetSiteCopyCache();
		vi.stubGlobal("fetch", reply({ data: null }));
		expect(await getSiteCopy("es")).toBeNull();
		for (const bad of [
			{ ...COPY, hero_image: "https://evil.example/x.webp" },
			{ ...COPY, hero_image: "../secreto.webp" },
			{ ...COPY, hero_label: "" },
			{ ...COPY, hero_lead: "x".repeat(501) },
		]) {
			resetSiteCopyCache();
			vi.stubGlobal("fetch", reply({ data: bad }));
			expect(await getSiteCopy("es")).toBeNull();
		}
	});

	it("si el backend falla despues de haber respondido, conserva el ultimo valor bueno", async () => {
		const fetchMock = vi
			.fn()
			.mockImplementationOnce(async () => Response.json({ data: COPY }))
			.mockImplementationOnce(async () => new Response("x", { status: 503 }));
		vi.stubGlobal("fetch", fetchMock);
		await getSiteCopy("es");
		const later = Date.now() + SITE_COPY_TTL_MS + 1;
		expect(await getSiteCopy("es", later)).toEqual(COPY);
	});

	it("espera poco para no frenar la pagina", () => {
		expect(SITE_COPY_TIMEOUT_MS).toBeLessThanOrEqual(3000);
	});
});

describe("siteCopySchema: curriculum", () => {
	it("acepta la clave de un PDF dentro de cv/, o ninguna", () => {
		for (const cv_pdf of [
			"cv/CV-Erick-Gonzalez-ab12cd34.pdf",
			null,
			undefined,
		]) {
			expect(siteCopySchema.safeParse({ ...COPY, cv_pdf }).success).toBe(true);
		}
	});

	it("rechaza lo que no sea un PDF de cv/ (URL, ruta con .., otra carpeta, otro tipo)", () => {
		for (const cv_pdf of [
			"https://malo.example/cv.pdf",
			"//malo.example/cv.pdf",
			"cv/../secreto.pdf",
			"cv\\x.pdf",
			"projects/foto.webp",
			"site/cv.pdf",
			"cv/archivo.exe",
			"cv/sub/otro.pdf",
			"",
		]) {
			expect(siteCopySchema.safeParse({ ...COPY, cv_pdf }).success).toBe(false);
		}
	});
});

describe("siteCopySchema", () => {
	it("acepta las claves heredadas con y sin / inicial, y las de carpeta", () => {
		for (const hero_image of ["Aboutme.webp", "/Aboutme.webp", "site/a.webp"]) {
			expect(siteCopySchema.safeParse({ ...COPY, hero_image }).success).toBe(
				true,
			);
		}
	});
});
