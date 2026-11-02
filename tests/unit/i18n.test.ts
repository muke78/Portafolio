import { describe, expect, it } from "vitest";
import { getI18N } from "@/i18n";

describe("getI18N", () => {
	it("defaults to the Spanish locale when currentLocale is omitted", () => {
		const i18n = getI18N({});
		expect(i18n.META.META_TITLE).toBe("Erick González — Desarrollador Full-Stack");
	});

	it("returns distinct content for es vs en", () => {
		const es = getI18N({ currentLocale: "es" });
		const en = getI18N({ currentLocale: "en" });
		expect(es.META.META_TITLE).not.toBe(en.META.META_TITLE);
		expect(en.META.META_TITLE).toBe("Erick González — Full-Stack Developer");
	});

	it("returns content for the French locale too", () => {
		const fr = getI18N({ currentLocale: "fr" });
		expect(fr.META.META_TITLE).toBe("Erick González — Développeur Full-Stack");
	});

	it("falls back to the default locale for an unrecognized locale string", () => {
		// Regression guard for the routing:"manual" fix - an unknown /xx/
		// segment should never silently surface untranslated/undefined
		// content, it falls back to the same content as the default locale.
		const unknown = getI18N({ currentLocale: "xx" });
		const es = getI18N({ currentLocale: "es" });
		expect(unknown.META.META_TITLE).toBe(es.META.META_TITLE);
	});
});
