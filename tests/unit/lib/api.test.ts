import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:env/client", () => ({ VITE_API_URL: "https://api.test/api/" }));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "test-token-value" }));

const { ApiError, api, buildApiUrl } = await import("@/lib/api");

afterEach(() => vi.unstubAllGlobals());

const stubFetch = (response: Response) => {
	const fetchMock = vi.fn().mockResolvedValue(response);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
};

describe("buildApiUrl", () => {
	it("une la base (VITE_API_URL) y la ruta sin duplicar barras", () => {
		expect(buildApiUrl("/projects?currentLocale=es")).toBe(
			"https://api.test/api/projects?currentLocale=es",
		);
	});

	it("rechaza rutas sin / inicial, con // inicial o con .. como segmento", () => {
		expect(() => buildApiUrl("projects")).toThrow();
		expect(() => buildApiUrl("//evil.example/x")).toThrow();
		expect(() => buildApiUrl("/projects/../admin")).toThrow();
	});

	it("un .. dentro de la consulta no es un segmento de la ruta", () => {
		expect(() => buildApiUrl("/projects?currentLocale=..")).not.toThrow();
	});
});

describe("api", () => {
	it("el tiempo maximo se puede acortar para lo que no debe frenar una pagina", async () => {
		const timeout = vi.spyOn(AbortSignal, "timeout");
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(async () => Response.json({ data: {} })),
		);
		await api.get("/contact-info", { timeoutMs: 2000 });
		await api.get("/projects");
		expect(timeout.mock.calls.map((c) => c[0])).toEqual([2000, 10_000]);
		timeout.mockRestore();
	});

	it("GET manda el bearer y pide JSON", async () => {
		const fetchMock = stubFetch(Response.json({ data: { rows: [] } }));
		const { data } = await api.get("/projects");
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://api.test/api/projects");
		expect(init.method).toBe("GET");
		expect(init.headers.Authorization).toBe("Bearer test-token-value");
		expect(init.headers).not.toHaveProperty("Content-Type");
		expect(data).toEqual({ data: { rows: [] } });
	});

	it("POST serializa el cuerpo como JSON", async () => {
		const fetchMock = stubFetch(Response.json({ id: 7 }));
		const { data } = await api.post("/comments", { name: "x" });
		const init = fetchMock.mock.calls[0][1];
		expect(init.method).toBe("POST");
		expect(init.headers["Content-Type"]).toBe("application/json");
		expect(init.body).toBe('{"name":"x"}');
		expect(data).toEqual({ id: 7 });
	});

	it("una respuesta sin cuerpo no es un fallo", async () => {
		stubFetch(new Response(null, { status: 204 }));
		await expect(api.post("/contact-messages", {})).resolves.toEqual({
			data: undefined,
		});
	});

	it("un error trae solo el estado, nunca el cuerpo ni el token", async () => {
		stubFetch(
			new Response("secreto-interno test-token-value", { status: 500 }),
		);
		const error = (await api.get("/projects").catch((e) => e)) as InstanceType<
			typeof ApiError
		>;
		expect(error).toBeInstanceOf(ApiError);
		expect(error.status).toBe(500);
		expect(error.message).not.toContain("secreto-interno");
		expect(error.message).not.toContain("test-token-value");
	});

	it("corta la peticion con un tiempo limite", async () => {
		const fetchMock = stubFetch(Response.json({}));
		await api.get("/projects");
		expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
	});
});
