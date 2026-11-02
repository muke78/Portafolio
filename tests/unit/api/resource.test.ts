import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api", () => ({
	api: {
		get: (...a: unknown[]) => get(...a),
		post: (...a: unknown[]) => post(...a),
	},
}));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "secret-token" }));

const { GET, POST } = await import("@/pages/api/[resource]");

const getCtx = (resource: string | undefined, query = "") =>
	({
		params: { resource },
		url: new URL(`http://localhost/api/${resource}${query}`),
	}) as never;

const comment = {
	name: "Erick Gonzalez",
	job: "Developer",
	description: "Excelente trabajo, muy recomendable.",
	country: "Mexico",
	country_flag: "mx",
};

const postCtx = (
	resource: string | undefined,
	body: unknown,
	ip = "20.0.0.1",
) =>
	({
		params: { resource },
		url: new URL("http://localhost/api/x"),
		request: new Request("http://localhost/api/x", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		}),
		clientAddress: ip,
	}) as never;

describe("GET /api/[resource]", () => {
	beforeEach(() => {
		get.mockReset();
		post.mockReset();
	});

	it.each([
		"projects",
		"experiences",
		"comments",
		"about",
		"education",
		"skills",
	])("proxies %s with the bearer token", async (resource) => {
		get.mockResolvedValue({ data: { ok: resource } });
		const res = (await GET(getCtx(resource))) as Response;
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: resource });
		expect(get).toHaveBeenCalledWith(`/${resource}`, {
			headers: { Authorization: "Bearer secret-token" },
		});
	});

	it("forwards the locale to the backend", async () => {
		get.mockResolvedValue({ data: {} });
		await GET(getCtx("projects", "?currentLocale=en"));
		expect(get).toHaveBeenCalledWith("/projects?currentLocale=en", {
			headers: { Authorization: "Bearer secret-token" },
		});
	});

	it("404s an unknown or missing resource without calling the backend", async () => {
		expect(((await GET(getCtx("admin"))) as Response).status).toBe(404);
		expect(((await GET(getCtx(undefined))) as Response).status).toBe(404);
		expect(get).not.toHaveBeenCalled();
	});

	it("answers 503 when the backend fails", async () => {
		get.mockImplementation(() => Promise.reject(new Error("down")));
		expect(((await GET(getCtx("projects"))) as Response).status).toBe(503);
	});
});

describe("POST /api/[resource]", () => {
	beforeEach(() => {
		post.mockReset();
	});

	it("creates a comment and answers 201", async () => {
		post.mockResolvedValue({ data: { id: 7 } });
		const res = (await POST(
			postCtx("comments", comment, "20.0.0.2"),
		)) as Response;
		expect(res.status).toBe(201);
		expect(await res.json()).toEqual({ id: 7 });
		expect(post).toHaveBeenCalledWith("/comments", comment, {
			headers: { Authorization: "Bearer secret-token" },
		});
	});

	it("is read-only for every other resource (405)", async () => {
		for (const r of ["projects", "skills", "admin", undefined]) {
			expect(((await POST(postCtx(r, {}))) as Response).status).toBe(405);
		}
		expect(post).not.toHaveBeenCalled();
	});

	it("answers 503 when the backend fails", async () => {
		post.mockImplementation(() => Promise.reject(new Error("down")));
		const res = (await POST(
			postCtx("comments", comment, "20.0.0.3"),
		)) as Response;
		expect(res.status).toBe(503);
	});

	it("does not fail when the adapter cannot give a client address", async () => {
		post.mockResolvedValue({ data: {} });
		const ctx = {
			params: { resource: "comments" },
			url: new URL("http://localhost/x"),
			request: new Request("http://localhost/x", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(comment),
			}),
			get clientAddress(): string {
				throw new Error("no address");
			},
		};
		const res = (await POST(ctx as never)) as Response;
		expect(res.status).toBe(201);
	});

	it("rate-limits the sixth write from the same address", async () => {
		post.mockResolvedValue({ data: {} });
		const statuses: number[] = [];
		for (let i = 0; i < 6; i++) {
			const res = (await POST(
				postCtx("comments", comment, "20.0.0.9"),
			)) as Response;
			statuses.push(res.status);
		}
		expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
	});
});
