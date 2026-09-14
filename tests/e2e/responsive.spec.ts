import { expect, type Page, test } from "@playwright/test";

/**
 * Checks for horizontal overflow the user can actually experience, not
 * just "some element is wider than the viewport". Layout.astro sets
 * `overflow-x: hidden` on <body> on purpose (defensive backstop for
 * decorative absolutely-positioned elements like the cosmos/galaxy
 * background, which are intentionally sized past the viewport edge and
 * clipped). Comparing document.documentElement.scrollWidth/clientWidth
 * flags that clipped-but-harmless case as "overflow" (false positive) -
 * confirmed live: window.innerWidth reports a few px past the viewport
 * there, but window.visualViewport.width doesn't, and an explicit
 * window.scrollTo(x, 0) never actually moves scrollX. Attempting a real
 * scroll and checking it didn't move is what actually matches what a
 * visitor can do.
 */
const hasFunctionalHorizontalOverflow = (page: Page) =>
	page.evaluate(() => {
		window.scrollTo(100, 0);
		return window.scrollX > 0;
	});

test.describe("mobile viewport (375px)", () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test("home has no horizontal overflow", async ({ page }) => {
		await page.goto("/es/home");
		expect(await hasFunctionalHorizontalOverflow(page)).toBe(false);
	});

	test("admin login has no horizontal overflow", async ({ page }) => {
		await page.goto("/admin/login");
		expect(await hasFunctionalHorizontalOverflow(page)).toBe(false);
	});

	test("mobile nav sheet opens", async ({ page }) => {
		await page.goto("/es/home");
		await page.getByRole("button", { name: /Abrir menú|Menú/ }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
	});
});

test.describe("tablet viewport (768px)", () => {
	test.use({ viewport: { width: 768, height: 1024 } });

	test("home has no horizontal overflow", async ({ page }) => {
		await page.goto("/es/home");
		expect(await hasFunctionalHorizontalOverflow(page)).toBe(false);
	});
});
