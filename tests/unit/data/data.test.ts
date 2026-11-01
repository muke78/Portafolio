import { describe, expect, it } from "vitest";
import { countries } from "@/data/countries";
import { dataListNavbarEN } from "@/data/locales/en/dataNavbarEN";
import { dataListNavbar } from "@/data/locales/es/dataNavbar";
import { dataListNavbarFR } from "@/data/locales/fr/dataNavbarFR";

describe("navbar data", () => {
	const lists = {
		es: dataListNavbar,
		en: dataListNavbarEN,
		fr: dataListNavbarFR,
	};

	it("links the same sections, in the same order, in every language", () => {
		const targets = (l: typeof dataListNavbar) => l.map((i) => i.to);
		expect(targets(lists.en)).toEqual(targets(lists.es));
		expect(targets(lists.fr)).toEqual(targets(lists.es));
	});

	it("points every item to an in-page anchor with a label", () => {
		for (const list of Object.values(lists)) {
			for (const item of list) {
				expect(item.to).toMatch(/^#[a-z]+$/);
				expect(item.label.trim()).not.toBe("");
			}
		}
	});
});

describe("countries", () => {
	it("uses unique two-letter upper-case codes", () => {
		const codes = countries.map((c) => c.code);
		expect(new Set(codes).size).toBe(codes.length);
		for (const code of codes) expect(code).toMatch(/^[A-Z]{2}$/);
	});

	it("has a name for every country", () => {
		for (const c of countries) expect(c.name.trim()).not.toBe("");
	});
});
