import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const row = { id: 1, title: "Demo" };
const ok = (rows: unknown[]) =>
	new Response(JSON.stringify({ data: { rows } }), { status: 200 });

describe("loadProjects", () => {
	beforeEach(() => {
		// The store keeps a module-level cache: reload it for each test.
		vi.resetModules();
		vi.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => vi.restoreAllMocks());

	it("asks the API once per locale and shares the promise", async () => {
		const fetchMock = vi.fn().mockResolvedValue(ok([row]));
		vi.stubGlobal("fetch", fetchMock);
		const { loadProjects } = await import("@/lib/projectsStore");

		const [a, b] = await Promise.all([loadProjects("es"), loadProjects("es")]);

		expect(a).toEqual([row]);
		expect(b).toBe(a);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith("/api/projects?currentLocale=es");
	});

	it("keeps a separate request per locale", async () => {
		const fetchMock = vi.fn().mockImplementation(async () => ok([row]));
		vi.stubGlobal("fetch", fetchMock);
		const { loadProjects } = await import("@/lib/projectsStore");

		await loadProjects("es");
		await loadProjects("en");

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("returns an empty list when the body has no rows", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
		);
		const { loadProjects } = await import("@/lib/projectsStore");
		expect(await loadProjects("es")).toEqual([]);
	});

	it("does not cache a failure: the next rail retries", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response("nope", { status: 503 }))
			.mockResolvedValueOnce(ok([row]));
		vi.stubGlobal("fetch", fetchMock);
		const { loadProjects } = await import("@/lib/projectsStore");

		expect(await loadProjects("es")).toEqual([]);
		expect(await loadProjects("es")).toEqual([row]);
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("survives a network error", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
		const { loadProjects } = await import("@/lib/projectsStore");
		expect(await loadProjects("fr")).toEqual([]);
		expect(console.error).toHaveBeenCalled();
	});
});
