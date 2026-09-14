import { expect, test } from "@playwright/test";

test.describe("mobile viewport (375px)", () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test("home has no horizontal overflow", async ({ page }) => {
		await page.goto("/es/home");
		const hasOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
		);
		expect(hasOverflow).toBe(false);
	});

	test("admin login has no horizontal overflow", async ({ page }) => {
		await page.goto("/admin/login");
		const hasOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
		);
		expect(hasOverflow).toBe(false);
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
		const hasOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
		);
		expect(hasOverflow).toBe(false);
	});
});
