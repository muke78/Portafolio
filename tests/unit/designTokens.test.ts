import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	contrast,
	flatten,
	inSrgbGamut,
	type Oklch,
	parseOklch,
	toLinearRgb,
} from "./helpers/oklch";

// Guards the rules in docs/UI_STANDARDS.md straight from src/styles/app.css:
// WCAG contrast, no pure black/white, colours inside the sRGB gamut.
const css = readFileSync("src/styles/app.css", "utf8");

const readBlock = (selector: RegExp): Record<string, string> => {
	const match = css.match(selector);
	if (!match) throw new Error(`Block not found: ${selector}`);
	const tokens: Record<string, string> = {};
	for (const line of match[1].matchAll(/--([\w-]+):\s*(oklch\([^)]*\))\s*;/g)) {
		tokens[line[1]] = line[2];
	}
	return tokens;
};

const themes = {
	light: readBlock(/:root\s*\{([\s\S]*?)\n\}/),
	dark: readBlock(/\.dark\s*\{([\s\S]*?)\n\}/),
} as const;

const color = (theme: keyof typeof themes, name: string): Oklch =>
	parseOklch(themes[theme][name]);

describe.each(["light", "dark"] as const)(
	"design tokens — %s theme",
	(theme) => {
		const bg = flatten(color(theme, "background"), [0, 0, 0]);
		const on = (fg: string, base = "background") =>
			contrast(flatten(color(theme, fg), bg), flatten(color(theme, base), bg));

		it("never uses pure black or pure white as a surface or text colour", () => {
			const names = [
				"background",
				"foreground",
				"card",
				"muted",
				"primary",
				"primary-foreground",
				"secondary",
				"secondary-foreground",
			];
			for (const name of names) {
				const { l, c } = color(theme, name);
				// Near-neutral AND at the extremes would read as #000 / #fff.
				const neutral = c < 0.004;
				expect(neutral && (l < 0.06 || l > 0.985), `${name} is pure b/w`).toBe(
					false,
				);
			}
		});

		it("keeps the base neutral: violet lives only in the primary family", () => {
			// Surfaces and text must stay near-neutral (no aubergine/tinted
			// backgrounds); only the brand accent and its aliases are chromatic.
			for (const name of [
				"background",
				"foreground",
				"card",
				"popover",
				"muted",
				"muted-foreground",
				"accent",
				"secondary",
				"night",
				"night-foreground",
			]) {
				if (!themes[theme][name]) continue;
				expect(color(theme, name).c, name).toBeLessThanOrEqual(0.02);
			}
			for (const name of ["primary", "ring", "chart-1", "sidebar-primary"]) {
				expect(color(theme, name).c, name).toBeGreaterThanOrEqual(0.15);
				expect(color(theme, name).h, name).toBeGreaterThanOrEqual(285);
				expect(color(theme, name).h, name).toBeLessThanOrEqual(300);
			}
		});

		it("keeps every opaque token inside the sRGB gamut", () => {
			for (const [name, value] of Object.entries(themes[theme])) {
				const c = parseOklch(value);
				if (c.a < 1) continue;
				expect(inSrgbGamut(c), `${name} ${value}`).toBe(true);
			}
		});

		it("body and secondary text meet WCAG AAA (7:1) or AA (4.5:1)", () => {
			expect(on("foreground")).toBeGreaterThanOrEqual(7);
			expect(on("foreground", "card")).toBeGreaterThanOrEqual(7);
			expect(on("muted-foreground")).toBeGreaterThanOrEqual(4.5);
			expect(on("muted-foreground", "card")).toBeGreaterThanOrEqual(4.5);
			expect(on("muted-foreground", "muted")).toBeGreaterThanOrEqual(4.5);
		});

		it("brand and semantic colours are readable as text (4.5:1)", () => {
			for (const name of [
				"primary",
				"destructive",
				"success",
				"info",
				"warning",
			]) {
				expect(on(name), name).toBeGreaterThanOrEqual(4.5);
			}
			expect(
				contrast(
					flatten(color(theme, "primary-foreground"), bg),
					flatten(color(theme, "primary"), bg),
				),
			).toBeGreaterThanOrEqual(4.5);
		});

		it("field borders and the focus ring meet 3:1 (WCAG 1.4.11)", () => {
			expect(on("input")).toBeGreaterThanOrEqual(3);
			expect(on("ring")).toBeGreaterThanOrEqual(3);
		});

		it("defines the warning and galaxy tokens", () => {
			for (const name of [
				"warning",
				"warning-foreground",
				"galaxy-core",
				"galaxy-arm",
				"galaxy-hot",
				"galaxy-star",
			]) {
				expect(themes[theme][name], name).toBeDefined();
			}
		});
	},
);

describe("no hardcoded pure black/white in the public UI", () => {
	const files: string[] = [];
	const walk = (dir: string) => {
		for (const entry of readdirSync(dir)) {
			const path = join(dir, entry);
			if (statSync(path).isDirectory()) walk(path);
			else if (/\.(astro|tsx|ts)$/.test(entry)) {
				files.push(path);
			}
		}
	};
	walk("src");

	const PURE =
		/\b(text|bg|border|ring|fill|stroke|from|to|via)-(white|black)\b|#(fff|000)(fff|000)?\b/i;

	it("uses tokens instead of white/black utilities or #fff/#000", () => {
		const offenders = files.filter((f) => PURE.test(readFileSync(f, "utf8")));
		expect(offenders).toEqual([]);
	});

	it("scans a meaningful number of files", () => {
		expect(files.length).toBeGreaterThan(40);
	});
});

describe("oklch helper sanity", () => {
	it("maps white-ish and black-ish to the right luminance extremes", () => {
		const white = toLinearRgb({ l: 1, c: 0, h: 0, a: 1 });
		expect(white[0]).toBeCloseTo(1, 2);
		expect(
			contrast(
				flatten({ l: 1, c: 0, h: 0, a: 1 }, [0, 0, 0]),
				flatten({ l: 0, c: 0, h: 0, a: 1 }, [0, 0, 0]),
			),
		).toBeCloseTo(21, 0);
	});
});
