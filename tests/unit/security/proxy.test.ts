import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Seguridad del proxy publico (/api/*): es la unica puerta que ve Internet y
 * la que agrega el token del backend, asi que aqui se prueban los ataques que
 * un visitante hostil intentaria desde el navegador o con curl.
 */
const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api", () => ({
	api: {
		get: (...a: unknown[]) => get(...a),
		post: (...a: unknown[]) => post(...a),
	},
}));
const SECRET = "tok-9f3a-super-secreto";
vi.mock("astro:env/server", () => ({
	API_SECRET_TOKEN: "tok-9f3a-super-secreto",
}));

const resource = await import("@/pages/api/[resource]");
const contact = await import("@/pages/api/contact-messages");

const SITE = "http://localhost";
const comment = {
	name: "Erick Gonzalez",
	description: "Excelente trabajo, muy recomendable.",
	country: "Mexico",
	country_flag: "mx",
};
const message = {
	name: "Erick",
	email: "e@example.com",
	phone: "+52 55 1234 5678",
};

let ipCounter = 0;
const freshIp = () =>
	`30.0.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`;

type Init = {
	body?: BodyInit;
	headers?: Record<string, string>;
	ip?: string;
};
const request = (init: Init = {}) =>
	new Request(`${SITE}/api/x`, {
		method: "POST",
		headers: { "Content-Type": "application/json", ...init.headers },
		body: init.body,
	});

const postComment = (init: Init = {}) =>
	resource.POST({
		params: { resource: "comments" },
		url: new URL(`${SITE}/api/comments`),
		request: request({ body: JSON.stringify(comment), ...init }),
		clientAddress: init.ip ?? freshIp(),
	} as never) as Promise<Response>;

const postContact = (init: Init = {}) =>
	contact.POST({
		url: new URL(`${SITE}/api/contact-messages`),
		request: request({ body: JSON.stringify(message), ...init }),
		clientAddress: init.ip ?? freshIp(),
	} as never) as Promise<Response>;

const endpoints = [
	["comentarios", postComment],
	["contacto", postContact],
] as const;

beforeEach(() => {
	get.mockReset();
	post.mockReset();
	post.mockResolvedValue({ data: {} });
});

describe.each(endpoints)(
	"%s: origen y tipo de contenido (CSRF)",
	(_n, send) => {
		it("rechaza un Origin ajeno con 403 y no llama al backend", async () => {
			const res = await send({ headers: { Origin: "https://evil.example" } });
			expect(res.status).toBe(403);
			expect(post).not.toHaveBeenCalled();
		});

		it.each([
			"http://localhost.evil.com",
			"https://localhost",
			"http://localhost:4321",
			"null",
		])("rechaza el Origin %s", async (origin) => {
			const res = await send({ headers: { Origin: origin } });
			expect(res.status).toBe(403);
		});

		it("rechaza Sec-Fetch-Site: cross-site aunque falte Origin", async () => {
			const res = await send({ headers: { "Sec-Fetch-Site": "cross-site" } });
			expect(res.status).toBe(403);
		});

		it("acepta el mismo origen", async () => {
			const res = await send({ headers: { Origin: SITE } });
			expect(res.status).toBeLessThan(300);
		});

		it.each([
			"text/plain",
			"application/x-www-form-urlencoded",
			"multipart/form-data; boundary=x",
			"",
		])("exige JSON: rechaza Content-Type %j con 415", async (type) => {
			const res = await send({ headers: { "Content-Type": type } });
			expect(res.status).toBe(415);
			expect(post).not.toHaveBeenCalled();
		});

		it("acepta application/json con charset", async () => {
			const res = await send({
				headers: { "Content-Type": "application/json; charset=utf-8" },
			});
			expect(res.status).toBeLessThan(300);
		});
	},
);

describe.each(endpoints)("%s: tamano y forma del cuerpo", (_n, send) => {
	it("413 si el cuerpo pasa de 10 KB", async () => {
		const res = await send({
			body: JSON.stringify({ name: "x".repeat(20_000) }),
		});
		expect(res.status).toBe(413);
		expect(post).not.toHaveBeenCalled();
	});

	it("413 aunque Content-Length mienta o falte", async () => {
		const res = await send({
			body: JSON.stringify({ name: "x".repeat(20_000) }),
			headers: { "Content-Length": "5" },
		});
		expect(res.status).toBe(413);
	});

	it.each(["{", "", "not json", "{'a':1}"])(
		"400 con JSON roto %j",
		async (body) => {
			const res = await send({ body });
			expect(res.status).toBe(400);
			expect(post).not.toHaveBeenCalled();
		},
	);

	it.each([null, 42, "hola", [], true])(
		"400 si el JSON no es un objeto (%j)",
		async (value) => {
			const res = await send({ body: JSON.stringify(value) });
			expect(res.status).toBe(400);
			expect(post).not.toHaveBeenCalled();
		},
	);

	it("400 con campos del tipo equivocado", async () => {
		const res = await send({
			body: JSON.stringify({ name: { $ne: "" }, email: ["a"], phone: 1 }),
		});
		expect(res.status).toBe(400);
		expect(post).not.toHaveBeenCalled();
	});
});

describe("comentarios: solo viajan los campos conocidos", () => {
	it("no reenvia status, direction ni campos inventados", async () => {
		const res = await postComment({
			body: JSON.stringify({
				...comment,
				status: "published",
				direction: "left",
				comment_id: 1,
				is_admin: true,
				__proto__: { polluted: true },
			}),
		});
		expect(res.status).toBe(201);
		const sent = post.mock.calls[0][1] as Record<string, unknown>;
		expect(Object.keys(sent).sort()).toEqual(
			["country", "country_flag", "description", "name"].sort(),
		);
		expect(({} as Record<string, unknown>).polluted).toBeUndefined();
	});

	it("400 si la descripcion es corta o enorme", async () => {
		for (const description of ["corto", "x".repeat(501)]) {
			const res = await postComment({
				body: JSON.stringify({ ...comment, description }),
			});
			expect(res.status).toBe(400);
		}
		expect(post).not.toHaveBeenCalled();
	});
});

describe("contacto: validacion y respuesta", () => {
	it.each([
		["correo invalido", { email: "no-es-correo" }],
		["correo con salto de linea", { email: "a@b.com\nBcc: x@y.com" }],
		["telefono con letras", { phone: "abc-defg-hij" }],
		["telefono corto", { phone: "123" }],
		["nombre corto", { name: "ab" }],
		["mensaje de mas de 260", { moreInformation: "m".repeat(261) }],
	])("400 con %s", async (_n, patch) => {
		const res = await postContact({
			body: JSON.stringify({ ...message, ...patch }),
		});
		expect(res.status).toBe(400);
		expect(post).not.toHaveBeenCalled();
	});

	it("solo reenvia name, email, phone y more_information", async () => {
		await postContact({
			body: JSON.stringify({
				...message,
				status: "replied",
				message_id: 9,
				x: 1,
			}),
		});
		const sent = post.mock.calls[0][1] as Record<string, unknown>;
		expect(Object.keys(sent).sort()).toEqual(
			["email", "more_information", "name", "phone"].sort(),
		);
	});
});

describe("el token del backend nunca sale hacia el navegador", () => {
	it("ni en las respuestas correctas", async () => {
		const res = await postComment();
		expect(await res.text()).not.toContain(SECRET);
	});

	it("ni cuando el backend falla con el token en el mensaje de error", async () => {
		const failure = Object.assign(new Error(`401 Bearer ${SECRET}`), {
			config: { headers: { Authorization: `Bearer ${SECRET}` } },
			response: { status: 401, data: { message: `Invalid token ${SECRET}` } },
		});
		post.mockRejectedValue(failure);
		get.mockRejectedValue(failure);

		const created = await postComment();
		expect(created.status).toBe(503);
		expect(await created.text()).not.toContain(SECRET);

		const sent = await postContact();
		expect(sent.status).toBe(503);
		expect(await sent.text()).not.toContain(SECRET);

		const read = (await resource.GET({
			params: { resource: "projects" },
			url: new URL(`${SITE}/api/projects`),
		} as never)) as Response;
		expect(read.status).toBe(503);
		expect(await read.text()).not.toContain(SECRET);
	});

	it("los mensajes de error son genericos, sin detalle del backend", async () => {
		post.mockRejectedValue(
			new Error("connect ECONNREFUSED 10.0.0.5:5432 stack..."),
		);
		const res = await postComment();
		const text = await res.text();
		expect(text).not.toMatch(/ECONNREFUSED|10\.0\.0\.5|stack/);
	});
});

describe("GET: la consulta que llega al backend", () => {
	const read = async (query: string) => {
		get.mockResolvedValue({ data: {} });
		await resource.GET({
			params: { resource: "projects" },
			url: new URL(`${SITE}/api/projects${query}`),
		} as never);
		return get.mock.calls[0][0] as string;
	};

	it("codifica currentLocale: no se pueden colar parametros propios", async () => {
		expect(await read("?currentLocale=es%26status%3Ddraft")).toBe(
			"/projects?currentLocale=es%26status%3Ddraft",
		);
	});

	it("no permite salir del recurso con ../ ni con barras", async () => {
		for (const name of [
			"..%2Fadmin",
			"projects/admin",
			"projects%2F..%2Fadmin",
		]) {
			const res = (await resource.GET({
				params: { resource: decodeURIComponent(name) },
				url: new URL(`${SITE}/api/x`),
			} as never)) as Response;
			expect(res.status).toBe(404);
		}
		expect(get).not.toHaveBeenCalled();
	});

	it("solo se lee de la lista cerrada de recursos publicos", async () => {
		for (const r of [
			"admin",
			"contact-messages",
			"users",
			"constructor",
			"__proto__",
		]) {
			const res = (await resource.GET({
				params: { resource: r },
				url: new URL(`${SITE}/api/x`),
			} as never)) as Response;
			expect(res.status).toBe(404);
		}
		expect(get).not.toHaveBeenCalled();
	});
});

describe("limite de peticiones", () => {
	it.each(endpoints)(
		"%s: la sexta peticion de la misma IP es 429",
		async (_n, send) => {
			const ip = freshIp();
			const statuses: number[] = [];
			for (let i = 0; i < 6; i++) statuses.push((await send({ ip })).status);
			expect(statuses[5]).toBe(429);
		},
	);

	it("una peticion rechazada por origen no gasta el cupo de la IP", async () => {
		const ip = freshIp();
		for (let i = 0; i < 10; i++) {
			await postComment({ ip, headers: { Origin: "https://evil.example" } });
		}
		expect((await postComment({ ip })).status).toBe(201);
	});
});
