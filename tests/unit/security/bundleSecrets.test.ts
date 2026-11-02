import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findLeaks } from "../../../scripts/check-bundle-secrets.mjs";

const SECRET = "tok-9f3a-super-secreto";
let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "bundle-"));
	mkdirSync(join(dir, "_astro"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("check-bundle-secrets", () => {
	it("no reporta nada si el bundle esta limpio", () => {
		writeFileSync(join(dir, "_astro", "app.js"), "console.log('hola')");
		writeFileSync(join(dir, "index.html"), "<html></html>");
		expect(findLeaks(dir, { API_SECRET_TOKEN: SECRET })).toEqual([]);
	});

	it("detecta el secreto en un JS del cliente", () => {
		writeFileSync(join(dir, "_astro", "app.js"), `fetch(u,{h:"${SECRET}"})`);
		const leaks = findLeaks(dir, { API_SECRET_TOKEN: SECRET });
		expect(leaks).toHaveLength(1);
		expect(leaks[0].variable).toBe("API_SECRET_TOKEN");
		expect(leaks[0].file).toContain("app.js");
	});

	it("detecta el secreto en HTML, CSS y source maps", () => {
		writeFileSync(join(dir, "a.html"), `<p>${SECRET}</p>`);
		writeFileSync(join(dir, "a.css"), `/* ${SECRET} */`);
		writeFileSync(join(dir, "a.js.map"), `{"sourcesContent":["${SECRET}"]}`);
		expect(findLeaks(dir, { API_SECRET_TOKEN: SECRET })).toHaveLength(3);
	});

	it("ignora imagenes y binarios", () => {
		writeFileSync(join(dir, "logo.webp"), SECRET);
		expect(findLeaks(dir, { API_SECRET_TOKEN: SECRET })).toEqual([]);
	});

	it("no busca valores vacios o demasiado cortos (evita falsos positivos)", () => {
		writeFileSync(join(dir, "a.js"), "abc abc abc");
		expect(findLeaks(dir, { API_SECRET_TOKEN: "abc" })).toEqual([]);
		expect(findLeaks(dir, { API_SECRET_TOKEN: "" })).toEqual([]);
		expect(findLeaks(dir, {})).toEqual([]);
	});
});
