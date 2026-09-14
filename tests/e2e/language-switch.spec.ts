import { expect, test } from "@playwright/test";

/**
 * Regression test for the exact bug reported: switching language while
 * at #contact (LangDrop does a full page reload to a URL that keeps
 * the current hash) used to leave the viewport a few sections above
 * where you were, in the new locale. Same root cause and same fix as
 * anchor-scroll.spec.ts (src/js/scrollFix.js) - this test just drives
 * it through the actual language switcher instead of a direct goto().
 */
test("switching language while at #contact lands back at #contact in the new locale", async ({
	page,
}) => {
	await page.goto("/es/home#contact");
	await expect
		.poll(async () => (await page.locator("#contact").boundingBox())?.y ?? -9999, {
			timeout: 8000,
		})
		.toBeGreaterThan(80);

	await page.getByRole("button", { name: /Español/ }).click();
	// Exact aria-label from LangDrop.tsx: `${NAVBAR_CHANGE_TO} ${label}`,
	// NAVBAR_CHANGE_TO in es.json is "Cambiar a".
	await page.locator('[aria-label="Cambiar a English"]').click();

	await page.waitForURL(/\/en\/home#contact/);

	await expect
		.poll(async () => (await page.locator("#contact").boundingBox())?.y ?? -9999, {
			timeout: 8000,
		})
		.toBeGreaterThan(80);

	const box = await page.locator("#contact").boundingBox();
	expect(box?.y).toBeLessThan(100);
});
