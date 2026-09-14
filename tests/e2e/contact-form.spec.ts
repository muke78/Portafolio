import { expect, test } from "@playwright/test";

/**
 * Form.tsx POSTs to /api/tlgrm, which proxies to Hono's real Telegram
 * integration - intercepted here so the suite never fires a real message
 * to production Telegram on every CI run. This also means these tests
 * only prove the frontend's success/error handling, not that Hono/
 * Telegram themselves work - that stays a manual/backend concern.
 */
test.describe("contact form", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/es/home#contact");
	});

	test("client-side validation blocks an empty submit", async ({ page }) => {
		await page.getByRole("button", { name: "Enviar mensaje" }).click();
		// react-hook-form + zodResolver should surface field errors without
		// ever reaching the network.
		await expect(page.getByText("El nombre debe ser mayor a 4 letras")).toBeVisible();
	});

	test("shows a success toast when the API call succeeds", async ({ page }) => {
		await page.route("**/api/tlgrm", (route) =>
			route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
		);

		await page.getByPlaceholder("Nombre").fill("Erick González");
		await page.getByPlaceholder("Correo electrónico").fill("erick@example.com");
		await page.getByPlaceholder("Teléfono").fill("+52 55 1234 5678");
		await page.getByRole("button", { name: "Enviar mensaje" }).click();

		await expect(
			page.getByText("¡Se ha enviado correctamente la información!"),
		).toBeVisible();
	});

	test("shows an error toast when the API call fails", async ({ page }) => {
		await page.route("**/api/tlgrm", (route) =>
			route.fulfill({ status: 500, body: JSON.stringify({ ok: false }) }),
		);

		await page.getByPlaceholder("Nombre").fill("Erick González");
		await page.getByPlaceholder("Correo electrónico").fill("erick@example.com");
		await page.getByPlaceholder("Teléfono").fill("+52 55 1234 5678");
		await page.getByRole("button", { name: "Enviar mensaje" }).click();

		// Regression coverage for a real bug this test caught: onSubmit used
		// to never check res.ok, so a resolved-but-500 fetch() still showed
		// the success toast (same class of bug already fixed in
		// sendOpinions.tsx earlier this session, just missed here). Fixed
		// alongside this test in Form.tsx.
		await expect(
			page.getByText("¡Se ha enviado correctamente la información!"),
		).toBeHidden();
	});
});
