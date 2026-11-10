import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:env/client", () => ({
	VITE_API_URL: "https://api.test/api",
	PUBLIC_MEDIA_URL: "https://media.test",
}));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "test-token-value" }));
vi.mock("@/lib/siteContact", () => ({
	getContact: vi.fn(async () => ({
		github_url: "https://github.com/muke78",
		linkedin_url: "https://www.linkedin.com/in/ejemplo/",
		linkedin_name: "Erick",
		phone: "+52 55 0000 0000",
		email: "erick@example.com",
	})),
}));
vi.mock("@/lib/siteCopy", () => ({
	getSiteCopy: vi.fn(async () => ({
		hero_image: "site/foto.webp",
		hero_image_alt: "x",
		hero_label: "x",
		hero_lead: "x",
		manifesto_text: "x",
		meta_description: "x",
		cv_pdf: "cv/erick.pdf",
	})),
}));
vi.mock("@/lib/api", () => ({
	api: {
		get: vi.fn(async () => ({
			data: {
				data: {
					rows: [
						{
							slug: "mi-sitio",
							category: "frontend",
							title: "Mi sitio",
							summary: "Un sitio.",
							link_web: "https://example.com",
							link_repo: "https://github.com/muke78/mi-sitio",
						},
					],
				},
			},
		})),
	},
}));

const { GET } = await import("@/pages/llms.txt");
const { resetProjectsCache } = await import("@/lib/llmsTxt");
const { api } = await import("@/lib/api");

const call = (site: URL | undefined) =>
	GET({
		site,
		url: new URL("https://fallback.example/llms.txt"),
	} as never) as Promise<Response>;

beforeEach(() => resetProjectsCache());

describe("llms.txt", () => {
	it("empieza con un H1 y es texto plano, con caché corta", async () => {
		const res = await call(new URL("https://khelde.dev"));
		expect(res.headers.get("Content-Type")).toContain("text/plain");
		expect(res.headers.get("Cache-Control")).toContain("s-maxage");
		const body = await res.text();
		expect(body.split("\n")[0]).toMatch(/^# \S/);
	});

	it("lista las tres paginas de inicio con el dominio configurado", async () => {
		const body = await (await call(new URL("https://khelde.dev/"))).text();
		for (const lang of ["es", "en", "fr"]) {
			expect(body).toContain(`](https://khelde.dev/${lang}/home)`);
		}
		expect(body).toContain("https://khelde.dev/sitemap-index.xml");
	});

	it("sin `site` usa el origen de la peticion", async () => {
		const body = await (await call(undefined)).text();
		expect(body).toContain("https://fallback.example/es/home");
	});

	it("incluye perfiles, correo, curriculum y proyectos con sus enlaces", async () => {
		const body = await (await call(new URL("https://khelde.dev"))).text();
		expect(body).toContain("[GitHub](https://github.com/muke78)");
		expect(body).toContain("[LinkedIn](https://www.linkedin.com/in/ejemplo/)");
		expect(body).toContain("Email: erick@example.com");
		expect(body).toContain("(https://media.test/cv/erick.pdf)");
		expect(body).toContain(
			"[Mi sitio](https://khelde.dev/en/project/mi-sitio): Un sitio. ([live](https://example.com/), [source](https://github.com/muke78/mi-sitio))",
		);
	});

	it("no publica el telefono", async () => {
		const body = await (await call(new URL("https://khelde.dev"))).text();
		expect(body).not.toContain("55 0000");
	});

	it("sale igual, sin proyectos, si el backend no responde", async () => {
		vi.mocked(api.get).mockRejectedValueOnce(new Error("503"));
		const res = await call(new URL("https://khelde.dev"));
		const body = await res.text();
		expect(res.status).toBe(200);
		expect(body).not.toContain("## Projects");
		expect(body).toContain("[GitHub]");
	});
});
