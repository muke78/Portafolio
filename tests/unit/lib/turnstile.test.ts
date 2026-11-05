import { describe, expect, it, vi } from "vitest";

vi.mock("astro:env/server", () => ({ TURNSTILE_SECRET_KEY: undefined }));

const { VERIFY_URL, splitTurnstileToken, turnstileFailure, verifyTurnstile } =
	await import("@/lib/turnstile");

const reply = (body: unknown, status = 200) =>
	vi.fn().mockResolvedValue(Response.json(body, { status }));

describe("verifyTurnstile", () => {
	it("sin clave secreta falla cerrado en produccion", async () => {
		expect(await verifyTurnstile("token", "1.2.3.4", { dev: false })).toBe(
			"unavailable",
		);
	});

	it("sin clave secreta acepta solo en desarrollo", async () => {
		expect(await verifyTurnstile(undefined, "1.2.3.4", { dev: true })).toBe(
			"ok",
		);
	});

	it("rechaza un token ausente, vacio, de otro tipo o enorme sin llamar a Cloudflare", async () => {
		const fetcher = reply({ success: true });
		for (const token of [undefined, "", 42, "x".repeat(3000)]) {
			expect(
				await verifyTurnstile(token, "1.2.3.4", { secret: "s", fetcher }),
			).toBe("failed");
		}
		expect(fetcher).not.toHaveBeenCalled();
	});

	it("manda secreto, token e IP a siteverify y acepta success:true", async () => {
		const fetcher = reply({ success: true });
		expect(
			await verifyTurnstile("tok", "203.0.113.9", { secret: "s", fetcher }),
		).toBe("ok");
		const [url, init] = fetcher.mock.calls[0];
		expect(url).toBe(VERIFY_URL);
		const form = init.body as URLSearchParams;
		expect(form.get("secret")).toBe("s");
		expect(form.get("response")).toBe("tok");
		expect(form.get("remoteip")).toBe("203.0.113.9");
	});

	it("no manda remoteip cuando la IP es desconocida", async () => {
		const fetcher = reply({ success: true });
		await verifyTurnstile("tok", "unknown", { secret: "s", fetcher });
		const form = fetcher.mock.calls[0][1].body as URLSearchParams;
		expect(form.has("remoteip")).toBe(false);
	});

	it("success distinto de true es un fallo", async () => {
		for (const body of [{ success: false }, { success: "true" }, {}]) {
			expect(
				await verifyTurnstile("tok", "1.2.3.4", {
					secret: "s",
					fetcher: reply(body),
				}),
			).toBe("failed");
		}
	});

	it("si Cloudflare no responde bien, no se acepta nada", async () => {
		expect(
			await verifyTurnstile("tok", "1.2.3.4", {
				secret: "s",
				fetcher: reply({}, 500),
			}),
		).toBe("unavailable");
		expect(
			await verifyTurnstile("tok", "1.2.3.4", {
				secret: "s",
				fetcher: vi.fn().mockRejectedValue(new Error("red")),
			}),
		).toBe("unavailable");
	});
});

describe("splitTurnstileToken", () => {
	it("separa el token y deja el resto intacto", () => {
		expect(splitTurnstileToken({ a: 1, turnstileToken: "t" })).toEqual({
			token: "t",
			rest: { a: 1 },
		});
	});

	it("un cuerpo que no es un objeto pasa sin tocar", () => {
		for (const value of [null, [], "x", 3]) {
			expect(splitTurnstileToken(value)).toEqual({
				token: undefined,
				rest: value,
			});
		}
	});
});

describe("turnstileFailure", () => {
	it("403 si el token no sirve y 503 si no se pudo verificar, sin detalle", async () => {
		const failed = turnstileFailure("failed");
		const unavailable = turnstileFailure("unavailable");
		expect(failed.status).toBe(403);
		expect(unavailable.status).toBe(503);
		expect(await failed.json()).toEqual({ message: "Verification failed" });
	});
});
