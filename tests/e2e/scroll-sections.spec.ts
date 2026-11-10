import { expect, test } from "@playwright/test";

/**
 * The Home has no tabs or hidden panels: every part of the story is a real
 * section on the page, reached by scrolling. This replaces the old
 * tabs-navigation spec.
 */
test.describe("Home sections without tabs", () => {
	test("About scenes and project rails are all on the page", async ({
		page,
	}) => {
		await page.goto("/es/home");

		for (const name of [
			"Acerca de mí",
			"Educación",
			"Experiencia",
			"Habilidades",
			"Proyectos",
		]) {
			await expect(
				page.getByRole("heading", { name, level: 2, exact: true }),
			).toBeAttached();
		}

		// One rail per project category, each with its own heading.
		for (const name of [
			"Frontend",
			"Backend",
			"Empresas",
			"Análisis de datos",
		]) {
			await expect(
				page.getByRole("heading", { name, level: 3, exact: true }),
			).toBeAttached();
		}

		// No tab selectors anywhere.
		await expect(page.locator("nav button[aria-pressed]")).toHaveCount(0);
	});
});
