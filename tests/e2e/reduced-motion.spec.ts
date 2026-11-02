import { expect, type Page, test } from "@playwright/test";
import { openCommentDialog } from "./helpers";

/**
 * prefers-reduced-motion: reduce must switch the whole motion layer off and
 * leave every piece of content simply visible: no engine, no pins, no hidden
 * initial states, no smooth scrolling, anchors still working.
 * (UI_STANDARDS 7.4 and 7.7.)
 */
test.use({ reducedMotion: "reduce" });

/** Every hook the engine hides before animating (UI_STANDARDS 12.4). */
const HIDDEN_BY_ENGINE = [
	"[data-reveal]",
	"[data-split]",
	"[data-stagger-item]",
	"[data-fly-chip]",
	"[data-mask]",
	"[data-hero-label]",
	"[data-hero-line]",
	"[data-hero-lead]",
	"[data-hero-cta] > *",
	"[data-hero-portrait]",
	"[data-hero-rings]",
	"[data-hero-bar]",
	"[data-fab]",
	"[data-detail-back]",
	"[data-detail-meta]",
	"[data-detail-title]",
	"[data-detail-figure]",
].join(",");

/** Walks the page so every client:visible island hydrates and fetches. */
const scrollThrough = async (page: Page) => {
	const height = await page.evaluate(() => document.documentElement.scrollHeight);
	for (let y = 0; y < height; y += 700) {
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(120);
	}
	await page.waitForTimeout(800);
	await page.evaluate(() => window.scrollTo(0, 0));
};

/** Elements that match the hooks but are not fully shown. */
const stillHidden = (page: Page) =>
	page.evaluate((selector) => {
		const bad: string[] = [];
		for (const el of document.querySelectorAll<HTMLElement>(selector)) {
			// A disabled control ("No disponible") is dimmed on purpose.
			if (el.getAttribute("aria-disabled") === "true") continue;
			const style = getComputedStyle(el);
			const hidden =
				Number(style.opacity) < 1 ||
				style.visibility === "hidden" ||
				(style.clipPath !== "none" && style.clipPath !== "");
			if (hidden) bad.push(`${el.tagName}.${String(el.className).slice(0, 40)}`);
		}
		return bad;
	}, HIDDEN_BY_ENGINE);

test.describe("home with reduced motion", () => {
	test("the motion engine never starts", async ({ page }) => {
		await page.goto("/es/home");
		await expect(page.locator("html")).not.toHaveClass(/motion-ok/);
		expect(await page.evaluate(() => window.__motionReady)).toBeFalsy();
		// Give the page time to run any (wrongly) started engine.
		await page.waitForTimeout(1500);
		expect(await page.locator("html.motion-ok").count()).toBe(0);
	});

	test("nothing is pinned or scrubbed", async ({ page }) => {
		await page.goto("/es/home");
		await scrollThrough(page);
		await expect(page.locator(".pin-spacer")).toHaveCount(0);
		const positions = await page
			.locator("[data-manifesto], [data-hscroll]")
			.evaluateAll((els) => els.map((el) => getComputedStyle(el).position));
		expect(positions.length).toBeGreaterThan(0);
		expect(positions).not.toContain("fixed");
		// The reading-progress bar stays empty.
		const bar = await page
			.locator("[data-scroll-progress]")
			.evaluate((el) => getComputedStyle(el).transform);
		expect(bar === "none" || /matrix\(0,/.test(bar)).toBe(true);
	});

	test("the hero and every section are fully visible", async ({ page }) => {
		await page.goto("/es/home");
		await expect(
			page.getByRole("heading", { level: 1 }),
		).toBeVisible();
		await scrollThrough(page);
		expect(await stillHidden(page)).toEqual([]);
	});

	test("text is plain: no split words or lines", async ({ page }) => {
		await page.goto("/es/home");
		const manifesto = page.locator("[data-manifesto-text]");
		await expect(manifesto).toContainText("Diseño y construyo productos web");
		expect(await manifesto.locator("div").count()).toBe(0);
		const titleWrappers = await page
			.locator("[data-split] > div[aria-hidden]")
			.count();
		expect(titleWrappers).toBe(0);
	});

	test("anchor links still land on their section, without smooth scrolling", async ({
		page,
	}) => {
		await page.goto("/es/home");
		expect(
			await page.evaluate(
				() => getComputedStyle(document.documentElement).scrollBehavior,
			),
		).toBe("auto");

		for (const [hash, name] of [
			["#about", "Acerca de mí"],
			["#projects", "Proyectos"],
			["#contact", "Contacto"],
		] as const) {
			await page.getByRole("link", { name: `Ir a ${name}` }).click();
			await expect
				.poll(
					async () => (await page.locator(hash).boundingBox())?.y ?? -9999,
					{ timeout: 10_000 },
				)
				.toBeGreaterThan(40);
			const box = await page.locator(hash).boundingBox();
			expect(box?.y, hash).toBeLessThan(140);
		}
	});

	test("the comment dialog opens at once, fully visible", async ({ page }) => {
		await page.goto("/es/home");
		const dialog = await openCommentDialog(page);
		expect(
			await dialog.evaluate((el) => Number(getComputedStyle(el).opacity)),
		).toBe(1);
	});

	test("the project detail page is readable at once", async ({ page }) => {
		await page.goto("/es/project/backend-hono");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
		await page.waitForTimeout(500);
		expect(await stillHidden(page)).toEqual([]);
	});
});
