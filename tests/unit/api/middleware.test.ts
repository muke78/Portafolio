import { describe, expect, it, vi } from "vitest";

// Only the identity helper is needed to import the middleware outside Astro.
vi.mock("astro:middleware", () => ({
	defineMiddleware: <T>(fn: T) => fn,
}));

const { onRequest } = await import("@/middleware");

const run = async (pathname: string) => {
	const next = vi.fn().mockResolvedValue(new Response("page"));
	const rewrite = vi
		.fn()
		.mockResolvedValue(new Response("not found page", { status: 200 }));
	const res = (await (
		onRequest as unknown as (c: unknown, n: unknown) => Promise<Response>
	)(
		{ url: new URL(`http://localhost${pathname}`), rewrite },
		next,
	)) as Response;
	return { res, next, rewrite };
};

describe("locale guard", () => {
	it.each([
		"/",
		"/es/home",
		"/en/home",
		"/fr/project/x",
		"/api/projects",
		"/404",
		"/_image",
		"/favicon.ico",
		"/sitemap-index.xml",
	])("lets %s through", async (path) => {
		const { next, rewrite } = await run(path);
		expect(next).toHaveBeenCalled();
		expect(rewrite).not.toHaveBeenCalled();
	});

	it.each(["/xx/home", "/admin/login", "/admin", "/es-ES/home", "/ES/home"])(
		"turns %s into a real 404",
		async (path) => {
			const { res, next, rewrite } = await run(path);
			expect(rewrite).toHaveBeenCalledWith("/404");
			expect(next).not.toHaveBeenCalled();
			expect(res.status).toBe(404);
		},
	);
});
