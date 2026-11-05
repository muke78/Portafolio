import { afterEach, describe, expect, it, vi } from "vitest";
import { ICON_NAME, techIconUrl } from "@/lib/techIcon";

const { GET } = await import("@/pages/api/icons/[name]");

afterEach(() => vi.unstubAllGlobals());

const svg = (body = "<svg/>", type = "image/svg+xml") =>
	new Response(body, { headers: { "content-type": type } });

const call = (name: string | undefined) =>
	GET({ params: { name } } as never) as Promise<Response>;

describe("techIconUrl", () => {
	it("apunta al propio sitio y codifica el nombre", () => {
		expect(techIconUrl("TypeScript")).toBe("/api/icons/typescript");
		expect(techIconUrl("a/b?c")).toBe("/api/icons/a%2Fb%3Fc");
	});

	it("solo acepta nombres simples", () => {
		for (const ok of ["ts", "nodejs", "react-light", "c++", "vue.js", "go_1"]) {
			expect(ICON_NAME.test(ok)).toBe(true);
		}
		for (const bad of ["", "a,b", "../x", "a b", "-x", "x".repeat(41)]) {
			expect(ICON_NAME.test(bad)).toBe(false);
		}
	});
});

describe("GET /api/icons/[name]", () => {
	it("rechaza nombres invalidos sin llamar al servicio", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		for (const name of [undefined, "a,b", "..", "a b"]) {
			expect((await call(name)).status).toBe(404);
		}
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("reenvia el SVG con cache y un CSP que impide ejecutar nada", async () => {
		const fetchMock = vi.fn().mockResolvedValue(svg("<svg>ok</svg>"));
		vi.stubGlobal("fetch", fetchMock);
		const res = await call("TS");
		expect(fetchMock.mock.calls[0][0]).toBe(
			"https://go-skill-icons.vercel.app/api/icons?i=ts",
		);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("<svg>ok</svg>");
		expect(res.headers.get("content-type")).toBe("image/svg+xml");
		expect(res.headers.get("cache-control")).toContain("s-maxage=2592000");
		expect(res.headers.get("content-security-policy")).toContain("sandbox");
		expect(res.headers.get("x-content-type-options")).toBe("nosniff");
	});

	it("no reenvia lo que no sea SVG ni lo demasiado grande", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(svg("<html/>", "text/html")),
		);
		expect((await call("ts")).status).toBe(502);
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(svg("x".repeat(300 * 1024))),
		);
		expect((await call("ts")).status).toBe(502);
	});

	it("traduce un fallo del servicio sin filtrar detalle", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("caido")));
		expect((await call("ts")).status).toBe(502);
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("", { status: 404 })),
		);
		expect((await call("ts")).status).toBe(404);
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("", { status: 500 })),
		);
		expect((await call("ts")).status).toBe(502);
	});
});
