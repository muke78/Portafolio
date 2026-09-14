import { expect, test } from "@playwright/test";

test("/admin without a session redirects to /admin/login", async ({ page }) => {
	await page.goto("/admin");
	await expect(page).toHaveURL(/\/admin\/login/);
});

test("wrong password is rejected", async ({ page }) => {
	await page.goto("/admin/login");
	await page.getByPlaceholder("••••••••").fill("definitely-not-the-real-password");
	await page.getByRole("button", { name: "Entrar" }).click();
	await expect(page.getByText(/incorrecta/i)).toBeVisible();
});

/**
 * The rate limiter (src/lib/rateLimit.ts) is in-memory, keyed by IP,
 * with a 5-minute window - it isn't reset between test runs against
 * the same dev server. This test only asserts the monotonic property
 * that matters (once tripped, it stays tripped and returns 429), so
 * it's robust whether this is the first run in the window or a repeat.
 */
test("login trips the rate limit after repeated failed attempts", async ({ request }) => {
	let lastStatus = 0;
	for (let i = 0; i < 6; i++) {
		const res = await request.post("/api/admin/login", {
			data: { password: `wrong-${i}-${Date.now()}` },
		});
		lastStatus = res.status();
	}
	expect(lastStatus).toBe(429);
});
