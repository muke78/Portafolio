import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, LOCALE_META, LOCALES } from "@/i18n/locales";
import en from "@/i18n/locales/en.json";
import es from "@/i18n/locales/es.json";
import fr from "@/i18n/locales/fr.json";

describe("locales", () => {
	it("knows es, en and fr, with es as the default", () => {
		expect([...LOCALES]).toEqual(["es", "en", "fr"]);
		expect(DEFAULT_LOCALE).toBe("es");
	});

	it("isLocale accepts supported locales only", () => {
		for (const l of LOCALES) expect(isLocale(l)).toBe(true);
		for (const bad of ["xx", "", "ES", "es-ES", "admin"]) {
			expect(isLocale(bad)).toBe(false);
		}
	});

	it("has metadata for every locale", () => {
		for (const l of LOCALES) {
			expect(LOCALE_META[l].label).toBeTruthy();
			expect(LOCALE_META[l].countryCode).toMatch(/^[A-Z]{2}$/);
			expect(LOCALE_META[l].bcp47.startsWith(l)).toBe(true);
		}
	});
});

/** Every key path of a translation file, as "A.B.C". */
const paths = (obj: unknown, prefix = ""): string[] =>
	obj && typeof obj === "object"
		? Object.entries(obj).flatMap(([k, v]) =>
				paths(v, prefix ? `${prefix}.${k}` : k),
			)
		: [prefix];

const valueAt = (file: unknown, path: string) =>
	path
		.split(".")
		.reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], file);

describe("translation files", () => {
	const keys = {
		es: paths(es).sort(),
		en: paths(en).sort(),
		fr: paths(fr).sort(),
	};

	it("have exactly the same keys in es, en and fr", () => {
		expect(keys.en).toEqual(keys.es);
		expect(keys.fr).toEqual(keys.es);
	});

	it("have no empty strings", () => {
		for (const [name, file] of Object.entries({ es, en, fr })) {
			const empty = paths(file).filter((p) => {
				const value = valueAt(file, p);
				return typeof value === "string" && value.trim() === "";
			});
			expect(empty, `${name} has empty strings`).toEqual([]);
		}
	});
});
