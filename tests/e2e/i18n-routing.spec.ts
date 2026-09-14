import { expect, test } from "@playwright/test";

const LOCALE_TITLES = [
	["/es/home", "Erick González — Desarrollador Full-Stack"],
	["/en/home", "Erick González — Full-Stack Developer"],
	["/fr/home", "Erick González — Développeur Full-Stack"],
] as const;

for (const [path, title] of LOCALE_TITLES) {
	test(`${path} has the correct per-locale title`, async ({ page }) => {
		await page.goto(path);
		await expect(page).toHaveTitle(title);
	});
}

/**
 * i18n.routing is "manual" specifically so /admin and /api/* aren't
 * swallowed by Astro's automatic locale-prefix routing (see
 * astro.config.mjs) - middleware.ts validates /[lang]/* segments
 * itself instead. An unrecognized locale should get the real 404 page
 * with a 404 status, not a silent fallback to the default locale.
 */
test("unknown locale segment returns a real 404", async ({ page }) => {
	const response = await page.goto("/xx/home");
	expect(response?.status()).toBe(404);
	await expect(page.getByText("404")).toBeVisible();
});

test("/admin/login is reachable (not swallowed by locale routing)", async ({ page }) => {
	const response = await page.goto("/admin/login");
	expect(response?.status()).toBe(200);
});
