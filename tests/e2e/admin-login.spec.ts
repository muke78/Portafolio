import { expect, test } from "@playwright/test";

test("/admin without a session redirects to /admin/login", async ({ page }) => {
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/admin\/login/);
});

test("wrong password is rejected", async ({ page }) => {
	await page.goto("/admin/login");
	await page.getByPlaceholder("tu@correo.com").fill("nadie@example.com");
	await page
		.getByPlaceholder("••••••••")
		.fill("definitely-not-the-real-password");
	await page.getByRole("button", { name: "Entrar" }).click();
	await expect(page.getByText(/inv[aá]lidas/i)).toBeVisible();
});

test("malformed email is rejected client-side, without a network round trip", async ({
	page,
}) => {
	await page.goto("/admin/login");
	// "a@b" pasa la validación nativa de type="email" (el regex del WHATWG
	// no exige un TLD con punto) pero falla adminLoginSchema (z.email(),
	// que sí lo exige) - es justo el hueco que el Zod del cliente tiene que
	// cubrir, no un string que el navegador ya bloquea por su cuenta.
	await page.getByPlaceholder("tu@correo.com").fill("a@b");
	await page.getByPlaceholder("••••••••").fill("cualquier-cosa");

	let requestFired = false;
	await page.route("**/api/admin/login", (route) => {
		requestFired = true;
		route.continue();
	});

	await page.getByRole("button", { name: "Entrar" }).click();
	await expect(page.getByText(/correo inv[aá]lido/i)).toBeVisible();
	expect(requestFired).toBe(false);
});

/**
 * The rate limiter (src/lib/rateLimit.ts) is in-memory, keyed by IP,
 * with a 5-minute window - it isn't reset between test runs against
 * the same dev server. This test only asserts the monotonic property
 * that matters (once tripped, it stays tripped and returns 429), so
 * it's robust whether this is the first run in the window or a repeat.
 */
test("login trips the rate limit after repeated failed attempts", async ({
	request,
}) => {
	let lastStatus = 0;
	for (let i = 0; i < 6; i++) {
		const res = await request.post("/api/admin/login", {
			data: {
				email: `x${i}@example.com`,
				password: `wrong-${i}-${Date.now()}`,
			},
		});
		lastStatus = res.status();
	}
	expect(lastStatus).toBe(429);
});
