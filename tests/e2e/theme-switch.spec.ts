import { expect, test } from "@playwright/test";

test("toggling the theme switches the dark class and persists across reload", async ({
	page,
}) => {
	await page.goto("/es/home");

	const html = page.locator("html");
	const toggle = page.getByRole("button", { name: /Cambiar a tema/ });

	const isDark = () => html.evaluate((el) => el.classList.contains("dark"));

	const startedDark = await isDark();

	await toggle.click();
	await expect.poll(isDark).toBe(!startedDark);

	// Reload: useTheme.ts reads from localStorage before falling back to
	// prefers-color-scheme, so the choice should survive a fresh navigation.
	const afterToggle = await isDark();
	await page.reload();
	await expect.poll(isDark).toBe(afterToggle);
});
