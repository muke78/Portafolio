import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { SECURITY_HEADERS, withSecurityHeaders } from "@/lib/securityHeaders";

vi.mock("astro:middleware", () => ({
	defineMiddleware: <T>(fn: T) => fn,
}));

const { onRequest } = await import("@/middleware");

const run = async (pathname: string, response = new Response("page")) => {
	const next = vi.fn().mockResolvedValue(response);
	const rewrite = vi.fn().mockResolvedValue(new Response("404"));
	return (await (
		onRequest as unknown as (c: unknown, n: unknown) => Promise<Response>
	)(
		{ url: new URL(`http://localhost${pathname}`), rewrite },
		next,
	)) as Response;
};

describe("cabeceras de seguridad", () => {
	const required = Object.entries(SECURITY_HEADERS);

	it.each(["/es/home", "/api/projects", "/", "/xx/home", "/_image"])(
		"la respuesta de %s las trae todas",
		async (path) => {
			const res = await run(path);
			for (const [name, value] of required) {
				expect(res.headers.get(name), name).toBe(value);
			}
		},
	);

	it("la pagina 404 tambien las trae", async () => {
		const res = await run("/xx/home");
		expect(res.status).toBe(404);
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
	});

	it("respeta una cabecera que la ruta ya definio", async () => {
		const res = await run(
			"/es/home",
			new Response("x", { headers: { "X-Frame-Options": "SAMEORIGIN" } }),
		);
		expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
	});

	it("funciona con cabeceras inmutables (respuesta de un fetch)", () => {
		const frozen = Response.redirect("http://localhost/x", 302);
		const res = withSecurityHeaders(frozen);
		expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
	});

	it("conserva estado y cuerpo", async () => {
		const res = withSecurityHeaders(new Response("hola", { status: 201 }));
		expect(res.status).toBe(201);
		expect(await res.text()).toBe("hola");
	});
});

describe("valores de las cabeceras", () => {
	it("HSTS dura al menos un año y cubre subdominios", () => {
		const hsts = SECURITY_HEADERS["Strict-Transport-Security"];
		expect(Number(/max-age=(\d+)/.exec(hsts)?.[1])).toBeGreaterThanOrEqual(
			31_536_000,
		);
		expect(hsts).toContain("includeSubDomains");
	});

	it("no se puede embeber el sitio en un marco", () => {
		expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
		expect(SECURITY_HEADERS["Content-Security-Policy"]).toContain(
			"frame-ancestors 'none'",
		);
	});

	it("el CSP cierra plugins, <base> y formularios hacia otros sitios", () => {
		const csp = SECURITY_HEADERS["Content-Security-Policy"];
		for (const directive of [
			"object-src 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		]) {
			expect(csp).toContain(directive);
		}
	});

	it("el CSP no se debilita con comodines ni unsafe-eval", () => {
		const csp = SECURITY_HEADERS["Content-Security-Policy"];
		expect(csp).not.toMatch(/\*|unsafe-eval|unsafe-inline|data:/);
	});

	it("desactiva camara, microfono y geolocalizacion", () => {
		const policy = SECURITY_HEADERS["Permissions-Policy"];
		for (const feature of ["camera", "microphone", "geolocation"]) {
			expect(policy).toContain(`${feature}=()`);
		}
	});
});

describe("public/_headers (archivos estaticos)", () => {
	const file = readFileSync(join(process.cwd(), "public/_headers"), "utf8");

	it.each(Object.entries(SECURITY_HEADERS))(
		"declara %s con el mismo valor que el middleware",
		(name, value) => {
			expect(file).toContain(`${name}: ${value}`);
		},
	);

	it("aplica a todas las rutas", () => {
		expect(file).toMatch(/^\/\*\s*$/m);
	});
});
