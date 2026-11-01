import { describe, expect, it, vi } from "vitest";

vi.mock("astro:env/client", () => ({ VITE_API_URL: "https://api.test" }));

describe("api client", () => {
	it("targets VITE_API_URL and sends JSON", async () => {
		const { api } = await import("@/lib/api");
		expect(api.defaults.baseURL).toBe("https://api.test");
		expect(api.defaults.headers["Content-Type"]).toBe("application/json");
	});
});
