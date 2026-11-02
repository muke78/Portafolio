import { describe, expect, it } from "vitest";
import { GET } from "@/pages/robots.txt";

const call = (
	site: URL | undefined,
	requestUrl = "https://fallback.example/robots.txt",
) => GET({ site, url: new URL(requestUrl) } as never) as Response;

describe("robots.txt", () => {
	it("apunta el sitemap al dominio configurado en `site`", async () => {
		const res = call(new URL("https://khelde.dev"));
		expect(res.headers.get("Content-Type")).toContain("text/plain");
		const body = await res.text();
		expect(body).toContain("Sitemap: https://khelde.dev/sitemap-index.xml");
		expect(body).not.toContain("vercel");
	});

	it("deja fuera /api y permite el resto", async () => {
		const body = await call(new URL("https://khelde.dev")).text();
		expect(body).toContain("User-agent: *");
		expect(body).toContain("Allow: /");
		expect(body).toContain("Disallow: /api");
	});

	it("sin `site` usa el origen de la peticion", async () => {
		const body = await call(undefined).text();
		expect(body).toContain(
			"Sitemap: https://fallback.example/sitemap-index.xml",
		);
	});

	it("tolera un `site` con ruta", async () => {
		const body = await call(new URL("https://khelde.dev/portafolio/")).text();
		expect(body).toContain("Sitemap: https://khelde.dev/sitemap-index.xml");
	});
});
