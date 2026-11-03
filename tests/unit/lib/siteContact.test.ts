import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("astro:env/client", () => ({ VITE_API_URL: "https://api.test/api" }));
vi.mock("astro:env/server", () => ({ API_SECRET_TOKEN: "test-token-value" }));

const {
	CONTACT_TIMEOUT_MS,
	CONTACT_TTL_MS,
	FALLBACK_CONTACT,
	getContact,
	resetContactCache,
} = await import("@/lib/siteContact");

const FROM_API = {
	github_url: "https://github.com/otra-cuenta",
	linkedin_url: "https://www.linkedin.com/in/otra/",
	linkedin_name: "Otra Persona",
	phone: "+1 555 123 4567",
	email: "otra@example.com",
};

const reply = (body: unknown, status = 200) =>
	vi.fn().mockResolvedValue(Response.json(body, { status }));

beforeEach(() => resetContactCache());
afterEach(() => vi.unstubAllGlobals());

describe("getContact", () => {
	it("usa lo que entrega el backend", async () => {
		const fetchMock = reply({ success: true, data: FROM_API });
		vi.stubGlobal("fetch", fetchMock);
		expect(await getContact()).toEqual(FROM_API);
		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://api.test/api/contact-info");
		expect(init.method).toBe("GET");
	});

	it("una sola peticion por ventana, aunque la pidan varios a la vez", async () => {
		const fetchMock = reply({ success: true, data: FROM_API });
		vi.stubGlobal("fetch", fetchMock);
		await Promise.all([getContact(), getContact(), getContact()]);
		await getContact();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("pasada la ventana vuelve a preguntar y ve el cambio hecho en el CMS", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(Response.json({ data: FROM_API }))
			.mockResolvedValueOnce(
				Response.json({ data: { ...FROM_API, email: "nuevo@example.com" } }),
			);
		vi.stubGlobal("fetch", fetchMock);
		expect((await getContact()).email).toBe("otra@example.com");
		const later = Date.now() + CONTACT_TTL_MS + 1;
		expect((await getContact(later)).email).toBe("nuevo@example.com");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("sin respuesta del backend usa el respaldo", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("red")));
		expect(await getContact()).toEqual(FALLBACK_CONTACT);
	});

	it("si el backend falla despues de haber respondido, conserva el ultimo valor bueno", async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(Response.json({ data: FROM_API }))
			.mockResolvedValueOnce(new Response("x", { status: 503 }));
		vi.stubGlobal("fetch", fetchMock);
		await getContact();
		const later = Date.now() + CONTACT_TTL_MS + 1;
		expect(await getContact(later)).toEqual(FROM_API);
	});

	it("data null (aun no hay fila) y datos raros usan el respaldo", async () => {
		vi.stubGlobal("fetch", reply({ success: true, data: null }));
		expect(await getContact()).toEqual(FALLBACK_CONTACT);
		resetContactCache();
		for (const bad of [
			{ ...FROM_API, github_url: "https://evil.example/x" },
			{ ...FROM_API, linkedin_url: "javascript:alert(1)" },
			{ ...FROM_API, phone: "5511909105" },
			{ ...FROM_API, email: "no-es-correo" },
		]) {
			vi.stubGlobal("fetch", reply({ success: true, data: bad }));
			expect(await getContact()).toEqual(FALLBACK_CONTACT);
			resetContactCache();
		}
	});

	it("espera poco: su tope es menor que el del cliente", () => {
		expect(CONTACT_TIMEOUT_MS).toBeLessThanOrEqual(3000);
	});

	it("el respaldo pasa su propio esquema (nunca rompe el pie)", async () => {
		const { siteContactSchema } = await import("@/schemas/siteContactSchema");
		expect(siteContactSchema.safeParse(FALLBACK_CONTACT).success).toBe(true);
	});
});
