import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { openCommentDialog } from "./helpers";

/**
 * Automated WCAG 2.1 A/AA audit (axe-core) of the public pages, in both
 * themes and on desktop and phone. Automated rules cover about a third of
 * WCAG: keyboard order, zoom and screen-reader wording still need a human
 * pass (UI_STANDARDS 8).
 *
 * The audit runs with prefers-reduced-motion: reduce so every element is in
 * its final state (a half-faded word would be reported as low contrast).
 */
test.use({ reducedMotion: "reduce" });

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

/** Walks the page so every client:visible island hydrates and loads data. */
const loadEverything = async (page: Page) => {
	const height = await page.evaluate(
		() => document.documentElement.scrollHeight,
	);
	for (let y = 0; y < height; y += 600) {
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(150);
	}
	await page.waitForTimeout(1200);
	await page.evaluate(() => window.scrollTo(0, 0));
};

const setTheme = (page: Page, theme: "light" | "dark") =>
	page.evaluate((t) => {
		localStorage.setItem("theme", t);
		document.documentElement.classList.toggle("dark", t === "dark");
	}, theme);

const audit = async (page: Page) => {
	const { violations } = await new AxeBuilder({ page })
		// The WebGL galaxy and the SVG cosmos are decorative (aria-hidden).
		.exclude("[data-galaxy]")
		.withTags(TAGS)
		.analyze();
	return violations.map(
		(v) =>
			`${v.id} (${v.impact}): ${v.help}\n` +
			v.nodes
				.slice(0, 4)
				.map((n) => `    ${n.target.join(" ")}`)
				.join("\n"),
	);
};

for (const theme of ["dark", "light"] as const) {
	test.describe(`home, ${theme} theme`, () => {
		test("desktop has no axe violations", async ({ page }) => {
			await page.goto("/es/home");
			await setTheme(page, theme);
			await loadEverything(page);
			expect(await audit(page)).toEqual([]);
		});

		test("phone has no axe violations", async ({ page }) => {
			await page.setViewportSize({ width: 375, height: 812 });
			await page.goto("/es/home");
			await setTheme(page, theme);
			await loadEverything(page);
			expect(await audit(page)).toEqual([]);
		});
	});
}

test("project detail has no axe violations", async ({ page }) => {
	await page.goto("/es/project/backend-hono");
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	expect(await audit(page)).toEqual([]);
});

test("the comment dialog has no axe violations", async ({ page }) => {
	await page.goto("/es/home");
	await openCommentDialog(page);
	expect(await audit(page)).toEqual([]);
});

test.describe("structure and keyboard", () => {
	test("one h1, no skipped heading levels", async ({ page }) => {
		await page.goto("/es/home");
		await loadEverything(page);
		const levels = await page.evaluate(() =>
			[...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
				.filter((h) => !h.closest("[aria-hidden='true']"))
				.map((h) => Number(h.tagName[1])),
		);
		expect(levels.filter((l) => l === 1)).toHaveLength(1);
		for (let i = 1; i < levels.length; i++) {
			expect(
				levels[i] - levels[i - 1],
				`heading #${i} jumps from h${levels[i - 1]} to h${levels[i]}`,
			).toBeLessThanOrEqual(1);
		}
	});

	test("the skip link is the first tab stop and reaches the main content", async ({
		page,
	}) => {
		await page.goto("/es/home");
		await page.keyboard.press("Tab");
		const skip = page.getByRole("link", { name: /saltar al contenido/i });
		await expect(skip).toBeFocused();
		await expect(skip).toBeVisible();
		await expect(page.locator("#main-content")).toHaveCount(1);
	});

	test("every interactive element shows a focus indicator", async ({
		page,
	}) => {
		await page.goto("/es/home");
		const missing: string[] = [];
		for (let i = 0; i < 14; i++) {
			await page.keyboard.press("Tab");
			const info = await page.evaluate(() => {
				const el = document.activeElement as HTMLElement | null;
				if (!el || el === document.body) return null;
				const s = getComputedStyle(el);
				const visible =
					(s.outlineStyle !== "none" &&
						Number.parseFloat(s.outlineWidth) > 0) ||
					s.boxShadow !== "none";
				return {
					visible,
					label: `${el.tagName} ${el.textContent?.trim().slice(0, 30)}`,
				};
			});
			if (info && !info.visible) missing.push(info.label);
		}
		expect(missing).toEqual([]);
	});

	test("zoomed to 200% (640 px wide) nothing overflows sideways", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 640, height: 800 });
		await page.goto("/es/home");
		await loadEverything(page);
		const overflow = await page.evaluate(() => {
			window.scrollTo(100, 0);
			return window.scrollX > 0;
		});
		expect(overflow).toBe(false);
	});
});

test.describe("keyboard with the motion layer on", () => {
	test.use({ reducedMotion: "no-preference" });

	test("the project catalog is reachable by keyboard and 'Ver N más' keeps the focus", async ({
		page,
	}) => {
		await page.goto("/es/home#projects");
		const links = page.locator("#projects article h4 a");
		await expect(links.first()).toBeVisible({ timeout: 15_000 });

		// Every card title is a real link to the project detail route.
		const href = await links.first().getAttribute("href");
		expect(href).toMatch(/^\/es\/project\/.+/);

		// A category with more than six projects has the button; opening it shows ALL
		// the rest and moves the focus to the first new card.
		const toggle = page.locator("#projects button[aria-expanded]").first();
		if ((await toggle.count()) === 0) return;
		const section = page.locator("#projects section", { has: toggle });
		const before = await section.locator("article").count();
		await toggle.focus();
		await toggle.press("Enter");
		await expect(toggle).toHaveAttribute("aria-expanded", "true");
		expect(await section.locator("article").count()).toBeGreaterThan(before);
		await expect(section.locator("article h4 a").nth(before)).toBeFocused();
	});
});
