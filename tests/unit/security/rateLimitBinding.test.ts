import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetMissingBindingWarning, sharedLimiter } from "@/lib/rateLimit";

describe("sharedLimiter: el binding RL_PUBLIC_WRITE", () => {
	let error: ReturnType<typeof vi.spyOn>;
	beforeEach(() => {
		resetMissingBindingWarning();
		error = vi.spyOn(console, "error").mockImplementation(() => {});
	});
	afterEach(() => vi.restoreAllMocks());

	it("lo usa cuando existe y no avisa", async () => {
		const limit = vi.fn();
		const limiter = await sharedLimiter({
			dev: false,
			load: async () => ({ env: { RL_PUBLIC_WRITE: { limit } } }),
		});
		expect(limiter?.limit).toBe(limit);
		expect(error).not.toHaveBeenCalled();
	});

	it("avisa en produccion cuando el binding falta y cae al contador en memoria", async () => {
		const limiter = await sharedLimiter({
			dev: false,
			load: async () => ({ env: {} }),
		});
		expect(limiter).toBeNull();
		expect(error).toHaveBeenCalledTimes(1);
		expect(String(error.mock.calls[0][0])).toContain("RL_PUBLIC_WRITE");
	});

	it("avisa cuando el modulo de Cloudflare no se puede cargar", async () => {
		const limiter = await sharedLimiter({
			dev: false,
			load: async () => {
				throw new Error("no cloudflare");
			},
		});
		expect(limiter).toBeNull();
		expect(error).toHaveBeenCalledTimes(1);
	});

	it("avisa una sola vez por isolate, no en cada peticion", async () => {
		const opts = { dev: false, load: async () => ({ env: {} }) };
		await sharedLimiter(opts);
		await sharedLimiter(opts);
		await sharedLimiter(opts);
		expect(error).toHaveBeenCalledTimes(1);
	});

	it("en desarrollo y pruebas no avisa: ahi no hay binding", async () => {
		expect(await sharedLimiter({ dev: true })).toBeNull();
		expect(error).not.toHaveBeenCalled();
	});
});
