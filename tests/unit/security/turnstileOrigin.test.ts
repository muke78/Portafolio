import { describe, expect, it, vi } from "vitest";

vi.mock("astro:env/server", () => ({ TURNSTILE_SECRET_KEY: undefined }));

const { verifyTurnstile } = await import("@/lib/turnstile");

const reply = (body: unknown) =>
	vi.fn().mockResolvedValue(Response.json(body, { status: 200 }));
const base = { secret: "s" };

describe("verifyTurnstile: sitio y formulario del token", () => {
	it("acepta un token resuelto en este sitio y para este formulario", async () => {
		const fetcher = reply({
			success: true,
			hostname: "khelde.dev",
			action: "comment",
		});
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				hostname: "khelde.dev",
				action: "comment",
			}),
		).toBe("ok");
	});

	it("compara el sitio sin distinguir mayusculas", async () => {
		const fetcher = reply({ success: true, hostname: "Khelde.DEV" });
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				hostname: "khelde.dev",
			}),
		).toBe("ok");
	});

	it("rechaza un token resuelto en otro sitio", async () => {
		const fetcher = reply({ success: true, hostname: "otro.example" });
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				hostname: "khelde.dev",
			}),
		).toBe("failed");
	});

	it("rechaza la respuesta que no trae sitio cuando se exige uno", async () => {
		const fetcher = reply({ success: true });
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				hostname: "khelde.dev",
			}),
		).toBe("failed");
	});

	it("rechaza un token de otro formulario (la clave de sitio es la misma)", async () => {
		const fetcher = reply({ success: true, action: "contact" });
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				action: "comment",
			}),
		).toBe("failed");
	});

	it("rechaza el token sin accion cuando se exige una", async () => {
		const fetcher = reply({ success: true });
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				action: "comment",
			}),
		).toBe("failed");
	});

	it("no exige sitio ni accion si el llamador no los pide", async () => {
		const fetcher = reply({ success: true });
		expect(await verifyTurnstile("t", "1.2.3.4", { ...base, fetcher })).toBe(
			"ok",
		);
	});

	it("un success:false sigue siendo fallo aunque coincidan sitio y accion", async () => {
		const fetcher = reply({
			success: false,
			hostname: "khelde.dev",
			action: "comment",
		});
		expect(
			await verifyTurnstile("t", "1.2.3.4", {
				...base,
				fetcher,
				hostname: "khelde.dev",
				action: "comment",
			}),
		).toBe("failed");
	});
});
