import { expect, test } from "@playwright/test";

/**
 * Project detail view: /[lang]/project/[id]. Cards on the home link to a
 * shareable URL (the slug), the page has its own title and a way back, and
 * unknown slugs / locales are real 404s.
 */
test("a project card opens its own shareable URL and the back button returns", async ({
	page,
}) => {
	// The rails fetch their cards when they come near the viewport: open the
	// page on the section and wait for the first card.
	await page.goto("/es/home#projects");
	const firstLink = page.locator("#projects article h4 a").first();
	await expect(firstLink).toBeVisible({ timeout: 15_000 });
	const href = await firstLink.getAttribute("href");
	expect(href).toMatch(/^\/es\/project\/[\w-]+$/);

	await firstLink.click();
	await expect(page).toHaveURL(new RegExp(`${href}$`));
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	await expect(page).toHaveTitle(/ — Erick González$/);

	await page.getByRole("link", { name: "Volver al inicio" }).click();
	await expect(page).toHaveURL(/\/es\/home#projects$/);
});

test("the detail page renders for each locale and by slug or numeric id", async ({
	page,
}) => {
	for (const path of [
		"/es/project/backend-hono",
		"/en/project/backend-hono",
		"/fr/project/backend-hono",
		"/es/project/15",
	]) {
		const response = await page.goto(path);
		expect(response?.status(), path).toBe(200);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	}
	await page.goto("/en/project/backend-hono");
	await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("an unknown project or locale is a real 404", async ({ request }) => {
	expect((await request.get("/es/project/no-existe")).status()).toBe(404);
	expect((await request.get("/xx/project/backend-hono")).status()).toBe(404);
});

test("the detail page does not overflow horizontally on mobile", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto("/es/project/backend-hono");
	await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth > window.innerWidth,
	);
	expect(overflow).toBe(false);
});
