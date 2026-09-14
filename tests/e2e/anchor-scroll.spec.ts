import { expect, test } from "@playwright/test";

/**
 * Regression test for the anchor-scroll race: loading a URL with a
 * #hash used to leave the viewport short of the target because
 * below-the-fold content (lazy images, client:visible islands, the
 * three.js canvas) was still loading and shifting the page height
 * after the initial jump. Fixed by src/js/scrollFix.js, which keeps
 * re-snapping to the target while the page is still resizing.
 */
test("anchor to #contact settles at the nav offset even while the page is still loading", async ({
	page,
}) => {
	await page.goto("/es/home#contact");

	// Poll instead of a fixed sleep - the exact settle time depends on
	// how fast everything below the fold finishes loading.
	await expect
		.poll(
			async () => {
				const box = await page.locator("#contact").boundingBox();
				return box?.y ?? -9999;
			},
			{ timeout: 8000 },
		)
		.toBeGreaterThan(80);

	const box = await page.locator("#contact").boundingBox();
	// scroll-mt-[88px] on the section - should land right at that offset,
	// not overshoot into the next section.
	expect(box?.y).toBeLessThan(100);
});

test("anchor to #opinions settles at the nav offset", async ({ page }) => {
	await page.goto("/es/home#opinions");

	await expect
		.poll(
			async () => {
				const box = await page.locator("#opinions").boundingBox();
				return box?.y ?? -9999;
			},
			{ timeout: 8000 },
		)
		.toBeGreaterThan(80);

	const box = await page.locator("#opinions").boundingBox();
	expect(box?.y).toBeLessThan(100);
});
