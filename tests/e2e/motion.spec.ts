import { expect, type Page, test } from "@playwright/test";
import { openCommentDialog } from "./helpers";

/**
 * The motion layer (no reduced-motion preference): it starts, the first
 * render stays light, the pinned scenes pin, anchors cross them and land,
 * and the menu highlights the section you are in.
 */
const DATA_API =
	/\/api\/(projects|comments|skills|experiences|education|about)/;

const NAV_LINKS = [
	["#about", "Acerca de mí"],
	["#projects", "Proyectos"],
	["#opinions", "Opiniones"],
	["#contact", "Contacto"],
] as const;

const activeLinks = (page: Page) =>
	page
		.locator("nav a[href^='#']")
		.filter({ has: page.locator("span.bg-primary") })
		.evaluateAll((els) => els.map((el) => el.getAttribute("href")));

test.describe("motion engine", () => {
	test("starts, and the first render fetches no section data", async ({
		page,
	}) => {
		const dataCalls: string[] = [];
		page.on("request", (req) => {
			if (DATA_API.test(req.url())) dataCalls.push(req.url());
		});

		await page.goto("/es/home");
		await expect(page.locator("html")).toHaveClass(/motion-ok/);
		await expect
			.poll(() => page.evaluate(() => window.__motionReady))
			.toBe(true);
		// Let the hero finish and any eager request fire.
		await page.waitForTimeout(2500);
		expect(dataCalls, "sections below the fold must fetch lazily").toEqual([]);
	});

	test("the hero name enters on load, without any scrolling", async ({
		page,
	}) => {
		await page.goto("/es/home");
		const lines = page.locator("[data-hero-line]");
		await expect(lines.first()).toBeVisible();
		await expect
			.poll(
				async () =>
					lines.evaluateAll((els) =>
						els.every(
							(el) =>
								Number(getComputedStyle(el).opacity) === 1 &&
								el.hasAttribute("data-revealed"),
						),
					),
				{ timeout: 8000 },
			)
			.toBe(true);
	});

	test("the manifesto pins while you read it and then lets go", async ({
		page,
	}) => {
		await page.goto("/es/home");
		await expect
			.poll(() => page.evaluate(() => window.__motionReady))
			.toBe(true);
		const manifesto = page.locator("[data-manifesto]");
		const spacer = page.locator(".pin-spacer").filter({ has: manifesto });
		await expect(spacer).toHaveCount(1);

		const top = await spacer.evaluate(
			(el) => el.getBoundingClientRect().top + window.scrollY,
		);
		const length = await spacer.evaluate(
			(el) => el.getBoundingClientRect().height,
		);

		await page.evaluate((y) => window.scrollTo(0, y), top + length * 0.4);
		await expect
			.poll(() => manifesto.evaluate((el) => getComputedStyle(el).position))
			.toBe("fixed");

		await page.evaluate((y) => window.scrollTo(0, y), top + length + 200);
		await expect
			.poll(() => manifesto.evaluate((el) => getComputedStyle(el).position))
			.not.toBe("fixed");
	});

	test("the projects rail cards show their images", async ({ page }) => {
		await page.goto("/es/home#projects");
		const first = page.locator("#projects article").first();
		await expect(first).toBeVisible({ timeout: 15_000 });
		await expect
			.poll(
				() =>
					first
						.locator("figure img")
						.evaluate((img: HTMLImageElement) => img.naturalWidth),
				{ timeout: 15_000 },
			)
			.toBeGreaterThan(0);
	});

	test("the comment dialog opens as a compact panel, not a full-screen overlay", async ({
		page,
	}) => {
		await page.goto("/es/home");
		await expect
			.poll(() => page.evaluate(() => window.__motionReady))
			.toBe(true);
		const dialog = await openCommentDialog(page);
		// The opening animation ends fully opaque.
		await expect
			.poll(() => dialog.evaluate((el) => Number(getComputedStyle(el).opacity)))
			.toBe(1);
		await expect(page.locator("[data-dialog-overlay]")).toHaveCount(0);
		const box = await dialog.boundingBox();
		const viewport = page.viewportSize();
		expect(box?.width).toBeLessThan(480);
		expect(box?.width).toBeLessThan((viewport?.width ?? 0) * 0.5);
	});
});

test.describe("navigation across the pinned sections", () => {
	for (const [hash, name] of NAV_LINKS) {
		test(`the "${name}" link lands on ${hash} and becomes the active link`, async ({
			page,
		}) => {
			await page.goto("/es/home");
			await expect
				.poll(() => page.evaluate(() => window.__motionReady))
				.toBe(true);

			await page.getByRole("link", { name: `Ir a ${name}` }).click();

			// Pins and lazy islands change the page length while we travel: the
			// engine keeps correcting until the section sits under the menu.
			await expect
				.poll(
					async () => (await page.locator(hash).boundingBox())?.y ?? -9999,
					{ timeout: 20_000, intervals: [250, 500, 1000] },
				)
				.toBeGreaterThan(70);
			await expect
				.poll(async () => (await page.locator(hash).boundingBox())?.y ?? 9999, {
					timeout: 20_000,
					intervals: [250, 500, 1000],
				})
				.toBeLessThan(110);

			await expect.poll(() => activeLinks(page)).toEqual([hash]);
		});
	}

	test("a URL with a hash opens on that section", async ({ page }) => {
		await page.goto("/es/home#projects");
		await expect
			.poll(
				async () => (await page.locator("#projects").boundingBox())?.y ?? -9999,
				{ timeout: 20_000, intervals: [250, 500, 1000] },
			)
			.toBeGreaterThan(70);
		const box = await page.locator("#projects").boundingBox();
		expect(box?.y).toBeLessThan(110);
	});

	test("the Desplazar cue in the hero goes to 'Qué hago'", async ({ page }) => {
		await page.goto("/es/home");
		await page.getByRole("link", { name: "Desplazar" }).click();
		await expect
			.poll(
				async () => (await page.locator("#what").boundingBox())?.y ?? -9999,
				{ timeout: 15_000 },
			)
			.toBeGreaterThan(70);
	});
});

test.describe("on a phone", () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test("the projects are a native swipeable row: nothing pinned and no sideways overflow", async ({
		page,
	}) => {
		await page.goto("/es/home#projects");
		await expect
			.poll(() => page.evaluate(() => window.__motionReady))
			.toBe(true);
		await expect(page.locator("#projects article").first()).toBeVisible({
			timeout: 15_000,
		});
		// Below 768 px the rail is not pinned: no pin-spacer, the row scrolls by hand.
		await expect(page.locator("#projects .pin-spacer")).toHaveCount(0);
		const swipe = await page
			.locator("#projects [data-hscroll-viewport]")
			.first()
			.evaluate((el) => getComputedStyle(el).overflowX);
		expect(swipe).toBe("auto");
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth,
		);
		expect(overflow).toBeLessThanOrEqual(1);
	});
});
