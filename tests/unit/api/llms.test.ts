import { describe, expect, it } from "vitest";
import { GET } from "@/pages/llms.txt";

const call = (site: URL | undefined) =>
	GET({
		site,
		url: new URL("https://fallback.example/llms.txt"),
	} as never) as Response;

describe("llms.txt", () => {
	it("empieza con un H1 y es texto plano", async () => {
		const res = call(new URL("https://khelde.dev"));
		expect(res.headers.get("Content-Type")).toContain("text/plain");
		const body = await res.text();
		expect(body.split("\n")[0]).toMatch(/^# \S/);
	});

	it("lista las tres paginas de inicio con el dominio configurado", async () => {
		const body = await call(new URL("https://khelde.dev/")).text();
		for (const lang of ["es", "en", "fr"]) {
			expect(body).toContain(`](https://khelde.dev/${lang}/home)`);
		}
		expect(body).toContain("https://khelde.dev/sitemap-index.xml");
	});

	it("sin `site` usa el origen de la peticion", async () => {
		const body = await call(undefined).text();
		expect(body).toContain("https://fallback.example/es/home");
	});
});
