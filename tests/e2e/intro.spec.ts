import { expect, test } from "@playwright/test";

/**
 * The origin-of-the-universe intro (src/lib/motion/intro.ts). The suite runs every other
 * spec with the "skip" preference already saved (playwright.config.ts storageState); here
 * each test chooses its own starting point.
 */
const FRESH = { cookies: [], origins: [] };
const REPLAY = {
	cookies: [],
	origins: [
		{
			origin: "http://localhost:4321",
			localStorage: [{ name: "intro", value: "replay" }],
		},
	],
};

test.describe("first visit", () => {
	test.use({ storageState: FRESH, reducedMotion: "no-preference" });

	test("shows the particle, keeps the page behind it out of reach and lets you skip", async ({
		page,
	}) => {
		await page.goto("/es/home");
		const gate = page.locator("[data-intro]");
		await expect(gate).toBeVisible();
		await expect(page.locator("[data-intro-point]")).toBeVisible();
		// The page is still there (crawlers, Lighthouse) but not reachable.
		await expect(page.locator("#main-content")).toHaveAttribute("inert", "");
		await expect(page.locator("h1")).toHaveCount(1);

		// The invitation shows up after about five seconds.
		await expect(page.getByText("¿Comenzamos?")).toBeVisible({
			timeout: 9_000,
		});

		await page.getByRole("button", { name: "Saltar la introducción" }).click();
		await expect(gate).toHaveCount(0);
		await expect(page.locator("#main-content")).not.toHaveAttribute(
			"inert",
			"",
		);
		await expect(page.locator("html")).not.toHaveClass(/intro-on/);
	});

	test("clicking the particle is the Big Bang and then the site is usable", async ({
		page,
	}) => {
		await page.goto("/es/home");
		await page.getByRole("button", { name: /Comenzar/ }).click();
		await expect(page.locator("[data-intro]")).toHaveCount(0, {
			timeout: 8_000,
		});
		await expect(page.locator("html")).not.toHaveClass(/intro-on/);
		// The hero ends up in place and the page scrolls again.
		await expect(page.locator("[data-hero-line]").first()).toBeVisible();
		const overflow = await page.evaluate(
			() => getComputedStyle(document.documentElement).overflow,
		);
		expect(overflow).not.toBe("hidden");
	});

	test("Escape skips it", async ({ page }) => {
		await page.goto("/es/home");
		await expect(page.locator("[data-intro]")).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(page.locator("[data-intro]")).toHaveCount(0);
	});

	test("the footer asks whether to see it again, and remembers the answer", async ({
		page,
	}) => {
		await page.goto("/es/home");
		await page.getByRole("button", { name: "Saltar la introducción" }).click();
		await page.locator("footer").scrollIntoViewIfNeeded();
		const ask = page.getByRole("group", { name: "¿Volver a ver el origen?" });
		await expect(ask).toBeVisible({ timeout: 10_000 });
		await ask.getByRole("button", { name: "No, ir directo al sitio" }).click();

		// Next visit: straight to the header, stars already spread.
		await page.goto("/es/home");
		await expect(page.locator("[data-intro]")).toHaveCount(0);
		await expect(page.locator("[data-hero-line]").first()).toBeVisible();
	});
});

test.describe("returning visitor who wants it again", () => {
	test.use({ storageState: REPLAY, reducedMotion: "no-preference" });

	test("lands on point zero every time, even after a refresh", async ({
		page,
	}) => {
		await page.goto("/es/home");
		await expect(page.locator("[data-intro]")).toBeVisible();
		await page.reload();
		await expect(page.locator("[data-intro]")).toBeVisible();
	});

	test("a deep link with an anchor goes straight in", async ({ page }) => {
		await page.goto("/es/home#projects");
		await expect(page.locator("[data-intro]")).toHaveCount(0);
	});
});

test.describe("reduced motion", () => {
	test.use({ storageState: FRESH, reducedMotion: "reduce" });

	test("there is no gate: the whole site is simply there", async ({ page }) => {
		await page.goto("/es/home");
		await expect(page.locator("[data-intro]")).toBeHidden();
		await expect(page.locator("html")).not.toHaveClass(/intro-on/);
		await expect(page.locator("[data-hero-line]").first()).toBeVisible();
	});
});
