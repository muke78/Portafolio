import { expect, test } from "@playwright/test";

/**
 * Form.tsx POSTs to /api/contact-messages, which proxies to Hono's
 * contact_messages table (Telegram was removed entirely - see
 * Backend_Portafolio, docs/02-comentarios-y-contacto.md). Intercepted
 * here so the suite never writes a real row to production Turso on every
 * CI run. This also means these tests only prove the frontend's
 * success/error handling, not that Hono itself works - that stays a
 * manual/backend concern.
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
		await page.route("**/api/contact-messages", (route) =>
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
		await page.route("**/api/contact-messages", (route) =>
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
