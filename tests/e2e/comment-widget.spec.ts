import { expect, test } from "@playwright/test";

test.describe("comment widget", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/es/home");
		await page.evaluate(() => {
			window.dispatchEvent(new CustomEvent("khelde:open-comment-widget"));
		});
	});

	test("opens with role=dialog", async ({ page }) => {
		await expect(page.getByRole("dialog", { name: "Dejar un comentario" })).toBeVisible();
	});

	test("stays open when clicking inside a field", async ({ page }) => {
		const dialog = page.getByRole("dialog", { name: "Dejar un comentario" });
		await dialog.getByPlaceholder("Tu nombre completo").click();
		await expect(dialog).toBeVisible();
	});

	test("closes when clicking outside", async ({ page }) => {
		const dialog = page.getByRole("dialog", { name: "Dejar un comentario" });
		await expect(dialog).toBeVisible();
		// A spot clearly outside the panel and the nav - the hero column.
		await page.mouse.click(10, 400);
		await expect(dialog).toBeHidden();
	});

	test("the trigger button toggles it closed", async ({ page }) => {
		const dialog = page.getByRole("dialog", { name: "Dejar un comentario" });
		await expect(dialog).toBeVisible();
		await page.getByRole("button", { name: "Cerrar formulario de comentario" }).click();
		await expect(dialog).toBeHidden();
	});
});
