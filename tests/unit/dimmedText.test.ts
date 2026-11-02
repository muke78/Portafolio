import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { MOTION } from "@/lib/motion/core";
import { contrast, flatten, parseOklch } from "./helpers/oklch";

// Scrubbed text starts "dim" and lights up while you read. The dim state is
// still text on the page, so it must stay legible (WCAG 1.4.3): at least 3:1
// for large text (>= 24 px) and 4.5:1 for body text, in both themes.
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

describe.each(["light", "dark"] as const)("dimmed scroll text — %s", (theme) => {
	const bg = flatten(parseOklch(themes[theme].background), [0, 0, 0]);
	const fg = parseOklch(themes[theme].foreground);
	const dimmed = (alpha: number) =>
		contrast(flatten({ ...fg, a: alpha }, bg), bg);

	it("keeps large text at 3:1 or better", () => {
		expect(dimmed(MOTION.dim.large[theme])).toBeGreaterThanOrEqual(3);
	});

	it("keeps body text at 4.5:1 or better", () => {
		expect(dimmed(MOTION.dim.body[theme])).toBeGreaterThanOrEqual(4.5);
	});
});
