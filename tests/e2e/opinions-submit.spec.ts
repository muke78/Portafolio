import { expect, test } from "@playwright/test";

/**
 * Extends comment-widget.spec.ts (open/close behaviour) with the actual
 * submit flow. Intercepts /api/comments so the suite never writes a real
 * testimonial into production Turso on every run.
 */
test.describe("opinions submit form", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/es/home");
		await page.evaluate(() => {
			window.dispatchEvent(new CustomEvent("khelde:open-comment-widget"));
		});
	});

	const fillValidForm = async (page: import("@playwright/test").Page) => {
		const dialog = page.getByRole("dialog", { name: "Dejar un comentario" });
		await dialog.getByPlaceholder("Tu nombre completo").fill("Erick González");
		await dialog.getByPlaceholder("Escribe tu experiencia aquí").fill(
			"Excelente trabajo en cada uno de los proyectos entregados.",
		);
		await dialog.getByRole("combobox").click();
		await page.getByRole("option", { name: "México" }).click();
		return dialog;
	};

	test("shows the submitted state on a successful POST", async ({ page }) => {
		await page.route("**/api/comments", (route) =>
			route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
		);

		const dialog = await fillValidForm(page);
		await dialog.getByRole("button", { name: "Enviar comentario" }).click();

		// sendOpinions.tsx swaps to <SubmittedOpinion> once isSubmitted flips.
		await expect(dialog.getByRole("button", { name: "Enviar comentario" })).toBeHidden();
	});

	test("shows an inline error and stays on the form when the POST fails", async ({
		page,
	}) => {
		await page.route("**/api/comments", (route) =>
			route.fulfill({ status: 500, body: JSON.stringify({ ok: false }) }),
		);

		const dialog = await fillValidForm(page);
		await dialog.getByRole("button", { name: "Enviar comentario" }).click();

		// Regression coverage for the res.ok check in sendOpinions.tsx -
		// a failed POST must surface role="alert", not silently succeed.
		await expect(dialog.getByRole("alert")).toBeVisible();
		await expect(dialog.getByRole("button", { name: "Enviar comentario" })).toBeVisible();
	});

	test("client-side validation blocks an empty submit", async ({ page }) => {
		const dialog = page.getByRole("dialog", { name: "Dejar un comentario" });
		await dialog.getByRole("button", { name: "Enviar comentario" }).click();
		await expect(dialog.getByText("El nombre debe ser mayor a 4 letras")).toBeVisible();
	});
});
