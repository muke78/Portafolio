import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();
vi.mock("@/lib/api", () => ({
	api: { post: (...a: unknown[]) => post(...a) },
}));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "secret-token" }));

const { POST } = await import("@/pages/api/contact-messages");

const call = (body: unknown, clientAddress = "10.0.0.1") =>
	POST({
		request: new Request("http://localhost/api/contact-messages", {
			method: "POST",
			body: JSON.stringify(body),
		}),
		clientAddress,
	} as never) as Promise<Response>;

const form = {
	name: "Erick",
	email: "e@example.com",
	phone: "+52 55 1234 5678",
	moreInformation: "Hola",
};

describe("POST /api/contact-messages", () => {
	beforeEach(() => {
		post.mockReset();
	});

	it("maps the form to the snake_case body Hono expects, with the bearer token", async () => {
		post.mockResolvedValue({});
		const res = await call(form, "10.0.0.2");

		expect(res.status).toBe(200);
		expect(post).toHaveBeenCalledWith(
			"/contact-messages",
			{
				name: "Erick",
				email: "e@example.com",
				phone: "+52 55 1234 5678",
				more_information: "Hola",
			},
			{ headers: { Authorization: "Bearer secret-token" } },
		);
		expect((await res.json()).message.moreInformation).toBe("Hola");
	});

	it("answers 503 when the backend fails", async () => {
		post.mockImplementation(() => Promise.reject(new Error("down")));
		const res = await call(form, "10.0.0.3");
		expect(res.status).toBe(503);
	});

	it("answers 503 on a body that is not JSON", async () => {
		const res = (await POST({
			request: new Request("http://localhost/x", { method: "POST", body: "{" }),
			clientAddress: "10.0.0.4",
		} as never)) as Response;
		expect(res.status).toBe(503);
	});

	it("rate-limits the sixth message from the same address", async () => {
		post.mockResolvedValue({});
		const statuses: number[] = [];
		for (let i = 0; i < 6; i++) {
			statuses.push((await call(form, "10.0.0.9")).status);
		}
		expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
	});

	it("does not fail when the adapter cannot give a client address", async () => {
		post.mockResolvedValue({});
		const ctx = {
			request: new Request("http://localhost/x", {
				method: "POST",
				body: JSON.stringify(form),
			}),
			get clientAddress(): string {
				throw new Error("no address");
			},
		};
		const res = (await POST(ctx as never)) as Response;
		expect(res.status).toBe(200);
	});
});
